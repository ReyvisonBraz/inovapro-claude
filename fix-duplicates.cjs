const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remover TODAS as declarações de isSimplified
content = content.replace(/.*const \[isSimplified, setIsSimplified\] = useState\(false\);\n?/g, '');

// Injetar uma única vez acima de skipEquipmentValidation
content = content.replace(
  '  // Estado para pular validação de equipamento',
  '  const [isSimplified, setIsSimplified] = useState(false);\n  // Estado para pular validação de equipamento'
);

// Limpar imports não utilizados (tudo o que for ícone do lucide-react que já foi pra outros arquivos)
content = content.replace(
  /import \{\n\s*X, User as UserIcon, Calendar, Plus, Search,\n\s*Cpu, HardDrive, Lock, Camera, Trash2, AlertCircle,\n\s*ClipboardList, Wrench, ChevronDown, ChevronUp, Check, QrCode\n\} from 'lucide-react';/g,
  "import { X, Check } from 'lucide-react';"
);

// Remover importações que sobraram
content = content.replace(/import { QRCodeSVG } from 'qrcode.react';\n/g, '');

fs.writeFileSync(filePath, content);
console.log('Duplicações corrigidas!');
