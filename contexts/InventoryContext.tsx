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
    // Initial load from Supabase with Offline Cache Fallback
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch from Supabase
                const { data: dbItems, error: iErr } = await supabase.from('inventory_items').select('*').order('nome');
                const { data: dbSuppliers, error: sErr } = await supabase.from('suppliers').select('*').order('nome');
                const { data: dbBatches, error: bErr } = await supabase.from('inventory_batches').select('*').order('validade');
                const { data: dbMovements, error: mErr } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false }).limit(1000);
                const { data: dbDistributions, error: dErr } = await supabase.from('distribuicoes').select('*, escola:schools(*), itens:distribuicao_itens(*, produto:inventory_items(*))').order('created_at', { ascending: false });
                const { data: dbOccurrences, error: oErr } = await supabase.from('operational_occurrences').select('*').order('created_at', { ascending: false });

                // Fallback and Map Items
                if (iErr) {
                    console.warn("Erro ao carregar catálogo de estoque, usando cache local:", iErr.message);
                    const localItems = JSON.parse(localStorage.getItem('nutriassist_inventory_v2') || '[]');
                    setInventory(localItems);
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
                }

                // Fallback and Map Suppliers
                if (sErr) {
                    console.warn("Erro ao carregar fornecedores, usando cache local:", sErr.message);
                    const localSuppliers = JSON.parse(localStorage.getItem('nutriassist_suppliers') || '[]');
                    setSuppliers(localSuppliers);
                } else {
                    setSuppliers(dbSuppliers || []);
                }

                // Fallback and Map Batches
                if (bErr) {
                    console.warn("Erro ao carregar lotes de estoque, usando cache local:", bErr.message);
                    const localBatches = JSON.parse(localStorage.getItem('nutriassist_batches_v1') || '[]');
                    setBatches(localBatches);
                } else {
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
                }

                // Fallback and Map Movements
                if (mErr) {
                    console.warn("Erro ao carregar movimentações de estoque, usando cache local:", mErr.message);
                    const localMovements = JSON.parse(localStorage.getItem('nutriassist_movements_v2') || '[]');
                    setMovements(localMovements);
                } else {
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
                }

                // Distributions and Occurrences (Secondary relational caches)
                if (dErr) {
                    console.warn("Erro ao carregar ordens de distribuição do Supabase:", dErr.message);
                } else {
                    setDistributions(dbDistributions || []);
                }

                if (oErr) {
                    console.warn("Erro ao carregar ocorrências operacionais do Supabase:", oErr.message);
                } else {
                    setOccurrences(dbOccurrences || []);
                }

            } catch (error) {
                console.error("Falha ao carregar dados de estoque do Supabase:", error);
                // General safety fallback
                const localItems = JSON.parse(localStorage.getItem('nutriassist_inventory_v2') || '[]');
                const localSuppliers = JSON.parse(localStorage.getItem('nutriassist_suppliers') || '[]');
                const localBatches = JSON.parse(localStorage.getItem('nutriassist_batches_v1') || '[]');
                const localMovements = JSON.parse(localStorage.getItem('nutriassist_movements_v2') || '[]');
                setInventory(localItems);
                setSuppliers(localSuppliers);
                setBatches(localBatches);
                setMovements(localMovements);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Automatic LocalStorage sync when state changes (only after initial load complete)
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('nutriassist_inventory_v2', JSON.stringify(inventory));
        }
    }, [inventory, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('nutriassist_suppliers', JSON.stringify(suppliers));
        }
    }, [suppliers, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('nutriassist_batches_v1', JSON.stringify(batches));
        }
    }, [batches, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('nutriassist_movements_v2', JSON.stringify(movements));
        }
    }, [movements, isLoading]);


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
