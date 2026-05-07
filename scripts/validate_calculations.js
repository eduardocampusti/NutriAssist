/**
 * Script de Validação de Cálculos Nutricionais - NutriAssist SME
 * Este script valida a lógica de cálculo per capita utilizada no PreparacaoReport.tsx
 * e garante consistência com o arredondamento esperado pelo PNAE.
 */

// Lógica idêntica ao componente PreparacaoReport.tsx
const calcFrontend = (val, quantidade) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '0,00';
    return ((num * quantidade) / 100).toFixed(2).replace('.', ',');
};

// Simulação da lógica do Banco de Dados (RPC)
const calcRPC = (val, quantidade) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    // O banco usa ROUND(val * (qty/100), 2)
    return Math.round((num * (quantidade / 100)) * 100) / 100;
};

const testCases = [
    {
        name: "Cenário 1: 100g de Alimento (Deve ser idêntico à composição)",
        val: 140,
        qty: 100,
        expectedFrontend: "140,00",
        expectedRPC: 140
    },
    {
        name: "Cenário 2: Baixa gramatura (Tempero 0.5g)",
        val: 10, // 10 kcal por 100g
        qty: 0.5,
        expectedFrontend: "0,05", // (10 * 0.5) / 100 = 0.05
        expectedRPC: 0.05
    },
    {
        name: "Cenário 3: Valor Irrisório (0.01g)",
        val: 5,
        qty: 0.01,
        expectedFrontend: "0,00", // (5 * 0.01) / 100 = 0.0005 -> toFixed(2) = 0.00
        expectedRPC: 0
    },
    {
        name: "Cenário 4: Dados Ausentes (null/undefined)",
        val: null,
        qty: 50,
        expectedFrontend: "0,00",
        expectedRPC: 0
    },
    {
        name: "Cenário 5: Valor com muitas casas decimais",
        val: 14.5678,
        qty: 33.33,
        expectedFrontend: "4,85", // (14.5678 * 33.33) / 100 = 4.8554... -> toFixed(2) = 4.86 ou 4.85?
        // JS toFixed(2) de 4.85547014 é "4.86"
        expectedFrontend: "4,86",
        expectedRPC: 4.86
    }
];

console.log("=== INICIANDO VALIDAÇÃO DE CÁLCULOS NUTRICIONAIS ===\n");

let passed = 0;
let failed = 0;

testCases.forEach(tc => {
    const resFE = calcFrontend(tc.val, tc.qty);
    const resRPC = calcRPC(tc.val, tc.qty);

    const feMatch = resFE === tc.expectedFrontend;
    const rpcMatch = Math.abs(resRPC - tc.expectedRPC) < 0.001;

    if (feMatch && rpcMatch) {
        console.log(`✅ [PASS] ${tc.name}`);
        passed++;
    } else {
        console.log(`❌ [FAIL] ${tc.name}`);
        console.log(`   Esperado FE: ${tc.expectedFrontend} | Obtido: ${resFE}`);
        console.log(`   Esperado RPC: ${tc.expectedRPC} | Obtido: ${resRPC}`);
        failed++;
    }
});

console.log(`\n=== RESULTADO FINAL ===`);
console.log(`Total: ${testCases.length}`);
console.log(`Passou: ${passed}`);
console.log(`Falhou: ${failed}`);

if (failed === 0) {
    console.log("\n✨ A lógica de cálculo está consistente e robusta.");
} else {
    process.exit(1);
}
