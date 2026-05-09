import React, { createContext, useContext, useState, useEffect } from 'react';
import { InventoryItem, InventoryMovement, InventoryBatch, Supplier, MovementType, MovementPurpose, InventoryCategory, Distribution, OperationalOccurrence } from '../types';
import { supabase } from '../services/supabase';
import { useToast } from './ToastContext';
import { useDocuments } from './DocumentContext';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/id';


interface InventoryContextType {
    inventory: InventoryItem[];
    movements: InventoryMovement[];
    batches: InventoryBatch[];
    suppliers: Supplier[];
    distributions: Distribution[];
    occurrences: OperationalOccurrence[];
    addItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'saldoAtual'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
    addMovement: (mov: Omit<InventoryMovement, 'id' | 'authorId'>, authorId: string) => Promise<void>;
    addBatch: (batch: Omit<InventoryBatch, 'id' | 'created_at' | 'ativo' | 'saldoAtual'>) => Promise<void>;
    updateBatch: (id: string, updates: Partial<InventoryBatch>) => Promise<void>;
    addSupplier: (s: Omit<Supplier, 'id' | 'created_at' | 'ativo'>) => Promise<void>;
    updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
    deduplicateInventory: () => Promise<void>;
    isLoading: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [batches, setBatches] = useState<InventoryBatch[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [occurrences, setOccurrences] = useState<OperationalOccurrence[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    const { addLog } = useDocuments();
    const { user } = useAuth();

    // Initial load and sync
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch from Supabase
                const { data: dbItems, error: iErr } = await supabase.from('inventory_items').select('*').order('nome');
                const { data: dbSuppliers, error: sErr } = await supabase.from('suppliers').select('*').order('nome');
                const { data: dbBatches, error: bErr } = await supabase.from('inventory_batches').select('*').order('validade');
                const { data: dbMovements, error: mErr } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false }).limit(1000);
                const { data: dbDistributions, error: dErr } = await supabase.from('distribuicoes').select('*, escola:escolas(*), itens:distribuicao_itens(*, produto:inventory_items(*))').order('created_at', { ascending: false });
                const { data: dbOccurrences, error: oErr } = await supabase.from('operational_occurrences').select('*').order('created_at', { ascending: false });

                // 2. Migration logic: if DB is empty, check localStorage
                if ((!dbItems || dbItems.length === 0) && !iErr) {
                    const localItems = JSON.parse(localStorage.getItem('nutriassist_inventory_v2') || '[]');
                    const localSuppliers = JSON.parse(localStorage.getItem('nutriassist_suppliers') || '[]');
                    const localBatches = JSON.parse(localStorage.getItem('nutriassist_batches_v1') || '[]');
                    const localMovements = JSON.parse(localStorage.getItem('nutriassist_movements_v2') || '[]');

                    if (localItems.length > 0 || localSuppliers.length > 0) {
                        if (localSuppliers.length > 0) await supabase.from('suppliers').insert(localSuppliers);
                        if (localItems.length > 0) await supabase.from('inventory_items').insert(localItems);
                        if (localBatches.length > 0) await supabase.from('inventory_batches').insert(localBatches);
                        if (localMovements.length > 0) await supabase.from('inventory_movements').insert(localMovements);

                        setInventory(localItems);
                        setSuppliers(localSuppliers);
                        setBatches(localBatches);
                        setMovements(localMovements);
                    } else {
                        // Seeding if both are empty
                        const initialSuppliersList: Supplier[] = [
                            { id: generateId(), nome: 'SUPERMERCADO CENTRAL', tipo: 'PESSOA_JURIDICA', documento: '00.000.000/0001-00', ativo: true, created_at: Date.now() },
                            { id: generateId(), nome: 'ASSOCIAÇÃO DE AGRICULTORES DE BROTAS', tipo: 'AGRICULTURA_FAMILIAR', documento: '11.111.111/0001-11', ativo: true, created_at: Date.now() }
                        ];
                        await supabase.from('suppliers').insert(initialSuppliersList);
                        setSuppliers(initialSuppliersList);

                        const initialInventory: InventoryItem[] = [
                            { id: generateId(), nome: 'ARROZ PARBOILIZADO', categoria: InventoryCategory.SECO, saldoAtual: 500, estoqueMinimo: 50, unidadeMedida: 'KG', kcal: 350, protein: 7, carbs: 78, fats: 1, correctionFactor: 1, costPerUnit: 5.50, isUltraProcessed: false, ativo: true, created_at: Date.now() },
                            { id: generateId(), nome: 'FEIJÃO CARIOCA', categoria: InventoryCategory.SECO, saldoAtual: 300, estoqueMinimo: 30, unidadeMedida: 'KG', kcal: 330, protein: 20, carbs: 60, fats: 1.5, correctionFactor: 1, costPerUnit: 7.20, isUltraProcessed: false, ativo: true, created_at: Date.now() },
                            { id: generateId(), nome: 'LEITE EM PÓ INTEGRAL', categoria: InventoryCategory.SECO, saldoAtual: 100, estoqueMinimo: 20, unidadeMedida: 'KG', kcal: 500, protein: 25, carbs: 38, fats: 27, correctionFactor: 1, costPerUnit: 25.00, isUltraProcessed: false, ativo: true, created_at: Date.now() }
                        ];
                        await supabase.from('inventory_items').insert(initialInventory);
                        setInventory(initialInventory);

                        const initialBatches: InventoryBatch[] = initialInventory.map(item => ({
                            id: generateId(),
                            itemId: item.id,
                            supplierId: initialSuppliersList[0].id,
                            dataEntrada: Date.now(),
                            validade: Date.now() + (90 * 24 * 60 * 60 * 1000),
                            quantidadeInicial: item.saldoAtual,
                            saldoAtual: item.saldoAtual,
                            valorUnitario: item.costPerUnit,
                            loteCod: 'INICIAL-AUTO',
                            ativo: true,
                            created_at: Date.now()
                        }));
                        await supabase.from('inventory_batches').insert(initialBatches);
                        setBatches(initialBatches);
                    }
                } else {
                    setInventory((dbItems || []).map((i: any) => ({
                        ...i,
                        saldoAtual: i.saldo_atual || i.saldoAtual || 0,
                        estoqueMinimo: i.estoque_minimo || i.estoqueMinimo || 0,
                        costPerUnit: i.cost_per_unit || i.costPerUnit || 0,
                        correctionFactor: i.correction_factor || i.correctionFactor || 1,
                        isUltraProcessed: i.is_ultra_processed || i.isUltraProcessed || false,
                        unidadeMedida: i.unidade_medida || i.unidadeMedida || 'KG',
                        created_at: i.created_at ? new Date(i.created_at).getTime() : Date.now()
                    })));
                    setSuppliers(dbSuppliers || []);
                    setBatches((dbBatches || []).map((b: any) => ({
                        ...b,
                        itemId: b.item_id || b.itemId,
                        supplierId: b.supplier_id || b.supplierId,
                        dataEntrada: b.data_entrada ? new Date(b.data_entrada).getTime() : b.dataEntrada,
                        validade: b.validade ? new Date(b.validade).getTime() : b.validade,
                        quantidadeInicial: b.quantidade_inicial || b.quantidadeInicial,
                        saldoAtual: b.saldo_atual || b.saldoAtual,
                        valorUnitario: b.valor_unitario || b.valorUnitario,
                        loteCod: b.lote_cod || b.loteCod,
                        created_at: b.created_at ? new Date(b.created_at).getTime() : Date.now()
                    })));
                    setMovements((dbMovements || []).map((m: any) => ({
                        ...m,
                        itemId: m.item_id || m.itemId,
                        schoolId: m.school_id || m.schoolId,
                        supplierId: m.supplier_id || m.supplierId,
                        batchId: m.batch_id || m.batchId,
                        authorId: m.author_id || m.authorId,
                        valuePerUnit: m.value_per_unit || m.valuePerUnit,
                        data: m.data_movimento ? new Date(m.data_movimento).getTime() : m.data,
                        created_at: m.created_at ? new Date(m.created_at).getTime() : Date.now()
                    })));
                    setDistributions(dbDistributions || []);
                    setOccurrences(dbOccurrences || []);
                }
            } catch (error) {
                console.error("Falha ao carregar dados de estoque do Supabase:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'saldoAtual'>) => {
        const exists = inventory.some(i => i.nome.trim().toUpperCase() === item.nome.trim().toUpperCase());
        if (exists) {
            addToast(`O item "${item.nome.toUpperCase()}" já existe no catálogo.`, 'warning');
            return;
        }
        const newItem: InventoryItem = {
            ...item,
            id: generateId(),
            created_at: Date.now(),
            saldoAtual: 0,
            ativo: true
        };

        const { error } = await supabase.from('inventory_items').insert(newItem);
        if (!error) {
            setInventory(prev => [...prev, newItem]);
            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Novo item cadastrado: ${newItem.nome}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'ESTOQUE',
                acao: 'CADASTRO_ITEM',
                dados: { id: newItem.id, nome: newItem.nome, categoria: newItem.categoria }
            });
        }
    };

    const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
        const oldItem = inventory.find(i => i.id === id);
        const { error } = await supabase.from('inventory_items').update(updates).eq('id', id);
        if (!error) {
            setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

            // AUDIT: Check for price change
            if (oldItem && updates.costPerUnit !== undefined && updates.costPerUnit !== oldItem.costPerUnit) {
                await addLog({
                    timestamp: Date.now(),
                    level: 'INFO',
                    message: `Preço alterado para ${oldItem.nome}`,
                    userId: user?.id || 'system',
                    usuario_id: user?.id || 'system',
                    modulo: 'ESTOQUE',
                    acao: 'ALTERACAO_PRECO',
                    dados: {
                        itemId: id,
                        nome: oldItem.nome,
                        precoAntigo: oldItem.costPerUnit,
                        precoNovo: updates.costPerUnit
                    }
                });
            } else if (oldItem) {
                await addLog({
                    timestamp: Date.now(),
                    level: 'INFO',
                    message: `Item editado: ${oldItem.nome}`,
                    userId: user?.id || 'system',
                    usuario_id: user?.id || 'system',
                    modulo: 'ESTOQUE',
                    acao: 'EDICAO_ITEM',
                    dados: { itemId: id, nome: oldItem.nome, updates }
                });
            }
        }
    };

    const addMovement = async (mov: Omit<InventoryMovement, 'id' | 'authorId'>, authorId: string) => {
        const newMovement: InventoryMovement = {
            ...mov,
            id: generateId(),
            authorId: authorId || 'system',
            created_at: Date.now()
        } as any;

        const { error } = await supabase.from('inventory_movements').insert(newMovement);
        if (error) {
            addToast("Erro ao registrar movimentação: " + error.message, 'error');
            return;
        }

        setMovements(prev => [newMovement, ...prev]);

        // UPDATE BATCH SALDO NO SUPABASE
        if (mov.tipo === MovementType.SAIDA && mov.batchId) {
            const batch = batches.find(b => b.id === mov.batchId);
            if (batch) {
                const newBatchSaldo = batch.saldoAtual - mov.quantidade;
                await supabase.from('inventory_batches').update({ saldoAtual: newBatchSaldo }).eq('id', mov.batchId);
                setBatches(prev => prev.map(b =>
                    b.id === mov.batchId ? { ...b, saldoAtual: newBatchSaldo } : b
                ));
            }
        }

        // UPDATE ITEM SALDO NO SUPABASE
        const item = inventory.find(i => i.id === mov.itemId);
        if (item) {
            const adjustment = mov.tipo === MovementType.ENTRADA ? mov.quantidade : -mov.quantidade;
            const newItemSaldo = (item.saldoAtual || 0) + adjustment;
            await supabase.from('inventory_items').update({ saldoAtual: newItemSaldo }).eq('id', mov.itemId);
            setInventory(prev => prev.map(i => i.id === mov.itemId ? { ...i, saldoAtual: newItemSaldo } : i));
        }
    };

    const addBatch = async (batchInput: Omit<InventoryBatch, 'id' | 'created_at' | 'ativo' | 'saldoAtual'>) => {
        const newBatch: InventoryBatch = {
            id: generateId(),
            itemId: batchInput.itemId,
            supplierId: batchInput.supplierId,
            loteCod: batchInput.loteCod,
            dataEntrada: Number(batchInput.dataEntrada),
            validade: Number(batchInput.validade),
            quantidadeInicial: Number(batchInput.quantidadeInicial),
            valorUnitario: Number(batchInput.valorUnitario),
            saldoAtual: Number(batchInput.quantidadeInicial),
            ativo: true,
            created_at: Date.now()
        };

        const { error } = await supabase.from('inventory_batches').insert(newBatch);
        if (error) {
            addToast("Erro ao registrar lote: " + error.message, 'error');
            return;
        }

        setBatches(prev => [...prev, newBatch]);

        // Record an ENTRADA movement for audit - Async
        await addMovement({
            itemId: batchInput.itemId,
            type: MovementType.ENTRADA,
            quantity: Number(batchInput.quantidadeInicial),
            date: typeof batchInput.dataEntrada === 'string' ? new Date(batchInput.dataEntrada).getTime() : Number(batchInput.dataEntrada),
            batchId: newBatch.id,
            supplierId: batchInput.supplierId,
            finalidade: MovementPurpose.REPOSICAO,
            observacao: `Entrada via Lote ${batchInput.loteCod || ''}`,
            valuePerUnit: Number(batchInput.valorUnitario)
        }, 'system');
    };

    const updateBatch = async (id: string, updates: Partial<InventoryBatch>) => {
        const oldBatch = batches.find(b => b.id === id);
        const { error } = await supabase.from('inventory_batches').update(updates).eq('id', id);
        if (!error) {
            setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));

            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Lote editado: ${oldBatch?.loteCod}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'ESTOQUE',
                acao: 'EDICAO_LOTE',
                dados: { batchId: id, itemId: oldBatch?.itemId, updates }
            });
        }
    };

    const addSupplier = async (s: Omit<Supplier, 'id' | 'created_at' | 'ativo'>) => {
        const newSupplier = { ...s, id: generateId(), created_at: Date.now(), ativo: true };
        const { error } = await supabase.from('suppliers').insert(newSupplier);
        if (!error) {
            setSuppliers(prev => [...prev, newSupplier]);
            await addLog({
                timestamp: Date.now(),
                level: 'INFO',
                message: `Novo fornecedor cadastrado: ${newSupplier.nome}`,
                userId: user?.id || 'system',
                usuario_id: user?.id || 'system',
                modulo: 'FORNECEDORES',
                acao: 'CADASTRO_FORNECEDOR',
                dados: { id: newSupplier.id, nome: newSupplier.nome }
            });
        }
    };

    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
        const { error } = await supabase.from('suppliers').update(updates).eq('id', id);
        if (!error) {
            setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        }
    };

    const deduplicateInventory = async () => {
        // This is a complex logic that might be better as a DB function, but for now we keep the UI logic
        // Updated to handle multiple items sequentially
        const uniqueItems: { [name: string]: InventoryItem } = {};
        const idMap: { [oldId: string]: string } = {};
        const itemsToDelete: string[] = [];

        inventory.forEach(item => {
            const nameKey = item.nome.trim().toUpperCase();
            if (!uniqueItems[nameKey]) {
                uniqueItems[nameKey] = { ...item };
            } else {
                uniqueItems[nameKey].saldoAtual += item.saldoAtual;
                idMap[item.id] = uniqueItems[nameKey].id;
                itemsToDelete.push(item.id);
            }
        });

        if (itemsToDelete.length === 0) {
            addToast("Nenhum item duplicado encontrado no catálogo.", 'info');
            return;
        }

        // Apply changes to Supabase (Warning: this is a destructive operation)
        // In a real app, you'd want a transaction or a RPC call.
        for (const item of Object.values(uniqueItems)) {
            await supabase.from('inventory_items').update({ saldoAtual: item.saldoAtual }).eq('id', item.id);
        }
        for (const id of itemsToDelete) {
            await supabase.from('inventory_items').delete().eq('id', id);
        }

        setInventory(Object.values(uniqueItems));
        // Movements update locally and could be batch updated in Supabase
        setMovements(prev => prev.map(mov => idMap[mov.itemId] ? { ...mov, itemId: idMap[mov.itemId] } : mov));

        await addLog({
            timestamp: Date.now(),
            level: 'INFO',
            message: `Deduplicação de estoque realizada. ${itemsToDelete.length} itens removidos.`,
            userId: user?.id || 'system',
            usuario_id: user?.id || 'system',
            modulo: 'SISTEMA',
            acao: 'DEDUPLICACAO_ESTOQUE',
            dados: { itensRemovidos: itemsToDelete.length }
        });

        addToast(`Sucesso! ${itemsToDelete.length} itens duplicados foram mesclados.`, 'success');
    };

    return (
        <InventoryContext.Provider value={{
            inventory, movements, batches, suppliers, distributions, occurrences,
            addItem, updateItem, addMovement, addBatch, updateBatch, addSupplier, updateSupplier, deduplicateInventory,
            isLoading
        }}>
            {children}
        </InventoryContext.Provider>
    );
};


export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};
