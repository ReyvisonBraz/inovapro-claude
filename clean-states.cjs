const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/const \[partSearch, setPartSearch\] = useState\(''\);\n?/g, '');
content = content.replace(/const \[isAddingPart, setIsAddingPart\] = useState\(false\);\n?/g, '');

fs.writeFileSync(filePath, content);
console.log('Estados não utilizados removidos com sucesso!');
