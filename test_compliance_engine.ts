
import { getItemNormativeStatus } from './services/menuEngine';
import { EducationalStage, InventoryItem, NovaClassification, NormativeStatus } from './types';

// Mock Items
const apple: InventoryItem = {
    id: '1', nome: 'Maçã',
    classificacaoNova: NovaClassification.IN_NATURA,
    isUltraProcessed: false,
    ativo: true, saldo_atual: 10, costPerUnit: 5, correctionFactor: 1, created_at: 0, estoque_minimo: 0, unidade_medida: 'kg', alimento_normativo_id: '1',
    nome_comercial: 'Maçã Fuji'
} as any;

const sausage: InventoryItem = {
    id: '2', nome: 'Salsicha',
    classificacaoNova: NovaClassification.ULTRAPROCESSADO,
    isUltraProcessed: true,
    ativo: true, saldo_atual: 10, costPerUnit: 10, correctionFactor: 1, created_at: 0, estoque_minimo: 0, unidade_medida: 'kg', alimento_normativo_id: '2',
    nome_comercial: 'Salsicha HotDog'
} as any;

const cannedCorn: InventoryItem = {
    id: '3', nome: 'Milho em Conserva',
    classificacaoNova: NovaClassification.PROCESSADO,
    isUltraProcessed: false,
    ativo: true, saldo_atual: 10, costPerUnit: 8, correctionFactor: 1, created_at: 0, estoque_minimo: 0, unidade_medida: 'kg', alimento_normativo_id: '3',
    nome_comercial: 'Milho Lata'
} as any;

const sugar: InventoryItem = {
    id: '4', nome: 'Açúcar Cristal',
    classificacaoNova: NovaClassification.INGREDIENTE_CULINARIO,
    isUltraProcessed: false,
    ativo: true, saldo_atual: 10, costPerUnit: 3, correctionFactor: 1, created_at: 0, estoque_minimo: 0, unidade_medida: 'kg', alimento_normativo_id: '4',
    nome_comercial: 'Açúcar',
    // Mocking the implicit name check:
    prohibitedForAgeUnder3: true // Schema would adhere this
} as any;

// Test Function
function runTests() {
    console.log("🚀 INICIANDO TESTES DE CONFORMIDADE PNAE (0-3 anos, 3-5 anos, >5 anos)");
    let passed = 0;
    let total = 0;

    const assert = (desc: string, actual: string, expected: string) => {
        total++;
        if (actual === expected) {
            console.log(`✅ [PASS] ${desc}: ${actual}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${desc}: Expected ${expected}, Got ${actual}`);
        }
    };

    // 1. CRECHE (0-3 Years)
    console.log("\n👶 TESTE: CRECHE (0-3 Anos)");
    assert("Maçã (In Natura)", getItemNormativeStatus(apple, EducationalStage.CRECHE), 'ALLOWED');
    assert("Salsicha (Ultra)", getItemNormativeStatus(sausage, EducationalStage.CRECHE), 'PROHIBITED');
    assert("Milho (Processado)", getItemNormativeStatus(cannedCorn, EducationalStage.CRECHE), 'RESTRICTED');
    assert("Açúcar (Ingrediente)", getItemNormativeStatus(sugar, EducationalStage.CRECHE), 'PROHIBITED');

    // 2. PRE_ESCOLA (3-5 Years)
    console.log("\n🧒 TESTE: PRÉ-ESCOLA (3-5 Anos)");
    assert("Maçã (In Natura)", getItemNormativeStatus(apple, EducationalStage.PRE_ESCOLA), 'ALLOWED');
    assert("Salsicha (Ultra)", getItemNormativeStatus(sausage, EducationalStage.PRE_ESCOLA), 'PROHIBITED'); // NEW RULE
    assert("Milho (Processado)", getItemNormativeStatus(cannedCorn, EducationalStage.PRE_ESCOLA), 'RESTRICTED');
    assert("Açúcar", getItemNormativeStatus(sugar, EducationalStage.PRE_ESCOLA), 'ALLOWED'); // Sugar itself allowed if not prohibited globally, usage moderated

    // 3. FUNDAMENTAL (> 5 Years)
    console.log("\n🧑 TESTE: FUNDAMENTAL (> 5 Anos)");
    assert("Maçã (In Natura)", getItemNormativeStatus(apple, EducationalStage.FUNDAMENTAL_I), 'ALLOWED');
    assert("Salsicha (Ultra)", getItemNormativeStatus(sausage, EducationalStage.FUNDAMENTAL_I), 'RESTRICTED'); // Restricted, not prohibited
    assert("Milho (Processado)", getItemNormativeStatus(cannedCorn, EducationalStage.FUNDAMENTAL_I), 'ALLOWED');

    console.log(`\n🏁 RESULTADO: ${passed}/${total} Testes Passaram.`);
}

runTests();
