import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuPlan, MenuExecution, DocStatus, MovementType, MovementPurpose, Dish } from '../types';
import { useInventory } from './InventoryContext';
import { supabase } from '../services/supabase';
import { useToast } from './ToastContext';
import { useDocuments } from './DocumentContext';
import { useAuth } from './AuthContext';

interface MenuContextType {
    menuPlans: MenuPlan[];
    executions: MenuExecution[];
    addMenuPlan: (plan: Omit<MenuPlan, 'id' | 'created_at' | 'authorId'>, authorId: string) => Promise<void>;
    updateMenuPlan: (id: string, updates: Partial<MenuPlan>) => Promise<void>;
    executeMenu: (execution: Omit<MenuExecution, 'id' | 'authorId'>, authorId: string) => Promise<void>;
    isLoading: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { inventory, addMovement } = useInventory();

    const [menuPlans, setMenuPlans] = useState<MenuPlan[]>([]);
    const [executions, setExecutions] = useState<MenuExecution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();
    const { addLog } = useDocuments();
    const { user } = useAuth();

    // Initial Load & Migration
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const { data: plansData, error: plansError } = await supabase
                    .from('menu_plans')
                    .select('*, menu_dishes(*)');

                const { data: execsData, error: execsError } = await supabase
                    .from('menu_executions')
                    .select('*');

                if (plansError) throw plansError;
                if (execsError) throw execsError;

                let plans: MenuPlan[] = (plansData || []).map((p: any) => ({
                    id: p.id,
                    titulo: p.titulo,
                    escolaId: p.escola_id,
                    studentNeId: p.student_ne_id,
                    etapa: p.etapa,
                    numAlunos: p.num_alunos,
                    diasLetivos: p.dias_letivos,
                    status: p.status,
                    isSpecial: p.is_special,
                    nutritionalStats: p.nutritional_stats,
                    estimatedCost: p.estimated_cost,
                    stockStatus: p.stock_status,
                    created_at: new Date(p.created_at).getTime(),
                    authorId: p.author_id,
                    preparacoes: (p.menu_dishes || []).map((d: any) => ({
                        id: d.id,
                        nome: d.nome,
                        mealType: d.meal_type,
                        diaSemana: d.dia_semana,
                        ingredientes: d.ingredientes
                    }))
                }));

                let execs: MenuExecution[] = (execsData || []).map((e: any) => ({
                    id: e.id,
                    menuId: e.menu_plan_id,
                    dishId: e.dish_id,
                    schoolId: e.school_id || 'REDE_GERAL',
                    date: new Date(e.data_execucao).getTime(),
                    data: new Date(e.data_execucao).getTime(),
                    servingsConfirmed: e.servings_confirmed || 0,
                    was_modified: e.was_modified,
                    notes: e.notes,
                    authorId: e.author_id
                }));

                // MIGRATION FROM LOCALSTORAGE
                if (plans.length === 0) {
                    const localPlansRaw = localStorage.getItem('nutriassist_menu_plans');
                    if (localPlansRaw) {
                        const localPlans = JSON.parse(localPlansRaw) as MenuPlan[];
                        for (const plan of localPlans) {
                            const { error: pErr } = await supabase.from('menu_plans').insert({
                                id: plan.id,
                                titulo: plan.titulo,
                                escola_id: plan.escolaId || null,
                                student_ne_id: plan.studentNeId || null,
                                etapa: plan.etapa,
                                num_alunos: plan.numAlunos,
                                dias_letivos: plan.diasLetivos,
                                status: plan.status,
                                is_special: plan.isSpecial || false,
                                author_id: plan.authorId,
                                created_at: new Date(plan.created_at).toISOString()
                            });

                            if (!pErr && plan.preparacoes) {
                                for (const dish of plan.preparacoes) {
                                    await supabase.from('menu_dishes').insert({
                                        id: dish.id,
                                        menu_plan_id: plan.id,
                                        nome: dish.nome,
                                        meal_type: dish.mealType,
                                        dia_semana: dish.diaSemana,
                                        ingredientes: dish.ingredientes
                                    });
                                }
                            }
                        }
                        plans = localPlans;
                    }
                }

                // FALLBACK: Seed Dummy Data if still empty (User Experience Guarantee)
                if (plans.length === 0) {
                    const dummyPlan: MenuPlan = {
                        id: 'dummy-1',
                        titulo: 'CARDÁPIO INTEGRAL - EXEMPLO',
                        escolaId: 'REDE_GERAL',
                        etapa: 'EDUCACAO_INTEGRAL' as any,
                        numAlunos: 150,
                        diasLetivos: 20,
                        status: DocStatus.APROVADO,
                        authorId: 'system',
                        created_at: Date.now(),
                        preparacoes: [
                            {
                                id: 'd1', nome: 'ARROZ, FEIJÃO E FRANGO', mealType: 'ALMOCO' as any, diaSemana: 1, ingredientes: [
                                    { itemId: 'bd-arroz', perCapitaGrams: 50 },
                                    { itemId: 'bd-feijao', perCapitaGrams: 30 }
                                ]
                            }
                        ],
                        faixaEtariaMinMeses: 36,
                        faixaEtariaMaxMeses: 120
                    };
                    plans = [dummyPlan];
                }

                if (execs.length === 0) {
                    const localExecsRaw = localStorage.getItem('nutriassist_executions');
                    if (localExecsRaw) {
                        const localExecs = JSON.parse(localExecsRaw) as MenuExecution[];
                        for (const ex of localExecs) {
                            await supabase.from('menu_executions').insert({
                                id: ex.id,
                                menu_plan_id: ex.menuId,
                                dish_id: ex.dishId,
                                data_execucao: new Date(ex.data).toISOString(),
                                servings_confirmed: ex.servingsConfirmed,
                                was_modified: ex.wasModified,
                                notes: ex.notes || null,
                                author_id: ex.authorId
                            });
                        }
                        execs = localExecs;
                    }
                }

                setMenuPlans(plans);
                setExecutions(execs);
            } catch (err) {
                console.error("Error loading menu data (falling back to local):", err);
                // Fallback to local
                const localPlansRaw = localStorage.getItem('nutriassist_menu_plans');
                if (localPlansRaw) setMenuPlans(JSON.parse(localPlansRaw));
                else {
                    // Seed dummy example if completely empty (to allow testing)
                    const dummyPlan: MenuPlan = {
                        id: 'dummy-1',
                        titulo: 'CARDÁPIO INTEGRAL - EXEMPLO',
                        escolaId: 'REDE_GERAL',
                        etapa: 'EDUCACAO_INTEGRAL' as any,
                        numAlunos: 150,
                        diasLetivos: 20,
                        status: DocStatus.APROVADO,
                        authorId: 'system',
                        created_at: Date.now(),
                        preparacoes: [
                            {
                                id: 'd1', nome: 'ARROZ, FEIJÃO E FRANGO', mealType: 'ALMOCO' as any, diaSemana: 1, ingredientes: [
                                    { itemId: 'bd-arroz', perCapitaGrams: 50 },
                                    { itemId: 'bd-feijao', perCapitaGrams: 30 }
                                ]
                            }
                        ],
                        faixaEtariaMinMeses: 36,
                        faixaEtariaMaxMeses: 120
                    };
                    setMenuPlans([dummyPlan]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const addMenuPlan = async (plan: Omit<MenuPlan, 'id' | 'created_at' | 'authorId'>, authorId: string) => {
        const id = crypto.randomUUID();
        const timestamp = Date.now();
        const newPlan: MenuPlan = {
            ...plan,
            id,
            created_at: timestamp,
            status: plan.status || DocStatus.ENVIADO, // Respect incoming status (usually ENVIADO from wizard)
            authorId: authorId
        };

        const { error: pErr } = await supabase.from('menu_plans').insert({
            id: newPlan.id,
            titulo: newPlan.titulo,
            escola_id: newPlan.escolaId || null,
            student_ne_id: newPlan.studentNeId || null,
            etapa: newPlan.etapa,
            num_alunos: newPlan.numAlunos,
            dias_letivos: newPlan.diasLetivos,
            status: newPlan.status,
            is_special: newPlan.isSpecial || false,
            author_id: newPlan.authorId,
            created_at: new Date(newPlan.created_at).toISOString()
        });

        if (pErr) {
            console.error("Error adding menu plan to Supabase (using local fallback):", pErr);
            // FALLBACK TO LOCAL STORAGE
            const existing = localStorage.getItem('nutriassist_menu_plans');
            const parsed = existing ? JSON.parse(existing) : [];
            localStorage.setItem('nutriassist_menu_plans', JSON.stringify([...parsed, newPlan]));
        } else {
            // If Primary DB worked, also save Dishes to DB
            if (newPlan.preparacoes) {
                for (const dish of newPlan.preparacoes) {
                    const { error: dErr } = await supabase.from('menu_dishes').insert({
                        id: dish.id,
                        menu_plan_id: newPlan.id,
                        nome: dish.nome,
                        meal_type: dish.mealType,
                        dia_semana: dish.diaSemana,
                        ingredientes: dish.ingredientes
                    });
                    if (dErr) console.error("Error saving dish:", dErr);
                }
            }
        }
        // Always update UI state
        setMenuPlans(prev => [...prev, newPlan]);

        await addLog({
            timestamp: Date.now(),
            level: 'INFO',
            message: `Plano de cardápio criado: ${newPlan.titulo}`,
            userId: user?.id || 'system',
            usuario_id: user?.id || 'system',
            modulo: 'CARDAPIO',
            acao: 'CRIACAO_CARDAPIO',
            dados: { id: newPlan.id, titulo: newPlan.titulo, etapa: newPlan.etapa }
        });
    };

    const updateMenuPlan = async (id: string, updates: Partial<MenuPlan>) => {
        const supabaseUpdates: any = {};
        if (updates.titulo) supabaseUpdates.titulo = updates.titulo;
        if (updates.status) supabaseUpdates.status = updates.status;
        if (updates.numAlunos !== undefined) supabaseUpdates.num_alunos = updates.numAlunos;

        if (Object.keys(supabaseUpdates).length > 0) {
            const { error } = await supabase.from('menu_plans').update(supabaseUpdates).eq('id', id);
            if (error) {
                console.error("Error updating menu plan:", error);
                return;
            }
        }

        setMenuPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const executeMenu = async (execution: Omit<MenuExecution, 'id' | 'authorId'>, authorId: string) => {
        const menu = menuPlans.find(m => m.id === execution.menuId);
        const dish = menu?.preparacoes.find(d => d.id === execution.dishId);
        if (!menu || !dish) return;

        // STOCK SAFETY CHECK & PER CAPITA VALIDATION
        const deviationLogs: string[] = [];
        const missingItems: string[] = [];

        dish.ingredientes.forEach(ing => {
            const item = inventory.find(i => i.id === ing.itemId);
            if (item) {
                const planejadoTotal = (execution.servingsConfirmed * ing.perCapitaGrams) / 1000;

                // Example simple consumption validation (we assume the raw quantity from execution
                // is already what's being deducted, but we can compare it with the per capita expectation)
                // In this implementation, the stock deduction is exactly the planned amount. 
                // To track deviations, we'd need the UI to send the "REAL" quantity used if different.
                // Assuming execution.notes might contain info or we just check if studentsServed matches expectatons.

                if (item.saldoAtual < planejadoTotal) {
                    missingItems.push(`${item.nome} (Saldo: ${item.saldoAtual.toFixed(2)}, Necessário: ${planejadoTotal.toFixed(2)})`);
                }
            }
        });

        if (missingItems.length > 0) {
            addToast(`Estoque insuficiente: ${missingItems[0]}...`, 'error');
            return;
        }

        const id = crypto.randomUUID();
        const fullExecution: MenuExecution = {
            ...execution,
            id,
            authorId
        };

        const { error: eErr } = await supabase.from('menu_executions').insert({
            id: fullExecution.id,
            menu_plan_id: fullExecution.menuId,
            dish_id: fullExecution.dishId,
            data_execucao: new Date(fullExecution.data).toISOString(),
            servings_confirmed: fullExecution.servingsConfirmed,
            was_modified: fullExecution.wasModified,
            notes: fullExecution.notes || null,
            author_id: fullExecution.authorId
        });

        if (eErr) {
            console.error("Error recording execution:", eErr);
            return;
        }

        setExecutions(prev => [fullExecution, ...prev]);

        // Perform movements
        for (const ing of dish.ingredientes) {
            const qtdTotal = (execution.servingsConfirmed * ing.perCapitaGrams) / 1000;
            await addMovement({
                itemId: ing.itemId,
                tipo: MovementType.SAIDA,
                quantidade: qtdTotal,
                schoolId: menu.escolaId,
                finalidade: menu.isSpecial ? MovementPurpose.ESPECIAL : MovementPurpose.REGULAR,
                observacao: `Execução Cardápio: ${menu.titulo} - ${dish.nome}`
            } as any, authorId);
        }

        addToast("Execução registrada com sucesso! Baixa no estoque realizada.", 'success');

        // ALERTS & INTEGRATED AUDIT
        const deviationAlerts = [];
        if (execution.servingsConfirmed < (menu.numAlunos * 0.8)) {
            deviationAlerts.push(`Baixa adesão: ${execution.servingsConfirmed} alunos atendidos (Meta: ${menu.numAlunos})`);
        } else if (execution.servingsConfirmed > (menu.numAlunos * 1.2)) {
            deviationAlerts.push(`Consumo excessivo: ${execution.servingsConfirmed} alunos atendidos (Meta: ${menu.numAlunos})`);
        }

        await addLog({
            timestamp: Date.now(),
            level: 'INFO',
            message: `Consumo registrado: ${dish.nome}`,
            userId: user?.id || 'system',
            usuario_id: user?.id || 'system',
            modulo: 'EXECUCAO',
            acao: 'CONSUMO_MERENDA',
            dados: {
                menuId: menu.id,
                dishName: dish.nome,
                escolaId: menu.escolaId,
                servings: execution.servingsConfirmed,
                alerts: deviationAlerts
            }
        });

        // Trigger notifications if significant deviation
        if (deviationAlerts.length > 0) {
            await supabase.from('notifications').insert({
                user_id: null, // Global/SME Nutricionista Alert
                title: 'Alerta de Consumo Atípico',
                message: `${deviationAlerts[0]} na unidade ${menu.escolaId} (${dish.nome})`,
                type: 'ALERTA',
                read: false,
                created_at: new Date().toISOString()
            });
        }
    };

    return (
        <MenuContext.Provider value={{
            menuPlans, executions,
            addMenuPlan, updateMenuPlan, executeMenu,
            isLoading
        }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};
