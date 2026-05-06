const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Trocar `const { ... } = useForm<ServiceOrderFormData>({` por `const methods = useForm<ServiceOrderFormData>({`
content = content.replace(/const\s+\{([^}]+)\}\s*=\s*useForm<ServiceOrderFormData>\(\{/m, (match, p1) => {
  return `const methods = useForm<ServiceOrderFormData>({\n  // Extracted methods below\n`;
});

// 2. Logo após `discount: 0\n    }\n  });`, injetar a extração:
content = content.replace(/(discount:\s*0\s*\}\s*\n\s*\}\);\s*)/, (match, p1) => {
  return `${p1}\n  const { register, handleSubmit, control, setValue, watch, reset, setError, clearErrors, formState: { errors } } = methods;\n`;
});

// 3. Substituir return ( <> por return ( <FormProvider {...methods}>
content = content.replace(/return\s*\(\s*<>\s*<div className="fixed inset-0/, 'return (\n    <FormProvider {...methods}>\n      <div className="fixed inset-0');

// 4. Substituir a tag de fechamento </> por </FormProvider> no final
const lastIndex = content.lastIndexOf('</>');
if (lastIndex !== -1) {
  content = content.substring(0, lastIndex) + '</FormProvider>' + content.substring(lastIndex + 3);
}

fs.writeFileSync(filePath, content);
console.log('Provider inserido com sucesso.');
