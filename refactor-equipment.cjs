const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/service-orders/ServiceOrderForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Adicionar os imports (FormProvider, e EquipmentSection)
if (!content.includes('import { FormProvider, useForm, useFieldArray } from \'react-hook-form\';')) {
  content = content.replace(
    "import { useForm, useFieldArray } from 'react-hook-form';",
    "import { FormProvider, useForm, useFieldArray } from 'react-hook-form';"
  );
}

if (!content.includes('import { EquipmentSection }')) {
  content = content.replace(
    "import { ServicesAndPartsSection } from './form-sections/ServicesAndPartsSection';",
    "import { ServicesAndPartsSection } from './form-sections/ServicesAndPartsSection';\nimport { EquipmentSection } from './form-sections/EquipmentSection';"
  );
}

// 2. Refatorar o useForm para capturar o "methods"
if (!content.includes('const methods = useForm<ServiceOrderFormData>')) {
  content = content.replace(
    '  const {\n    register,\n    handleSubmit,\n    control,\n    setValue,\n    watch,\n    reset,\n    setError,\n    clearErrors,\n    formState: { errors }\n  } = useForm<ServiceOrderFormData>({',
    '  const methods = useForm<ServiceOrderFormData>({\n'
  );
  content = content.replace(
    '    }\n  });\n\n  // @ts-ignore - React Hook Form tem problemas com inferência complexa de Zod',
    '    }\n  });\n  const { register, handleSubmit, control, setValue, watch, reset, setError, clearErrors, formState: { errors } } = methods;\n\n  // @ts-ignore - React Hook Form tem problemas com inferência complexa de Zod'
  );
}

// 3. Adicionar FormProvider em volta da interface Form
// O container do scroll é: <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">
// Mas os forms methods estão lá. Vamos colocar em volta do return.
// Procure por "return (\n    <>\n      <div className="fixed inset-0" e não em form tag.
if (!content.includes('<FormProvider {...methods}>')) {
  content = content.replace(
    '          {/* Modal Body */}\n          <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">',
    '          {/* Modal Body */}\n          <FormProvider {...methods}>\n          <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto flex-1 custom-scrollbar">'
  );
  
  content = content.replace(
    '          {/* Modal Footer */}\n          <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row justify-end gap-3">',
    '          {/* Modal Footer */}\n          <div className="p-6 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row justify-end gap-3">'
  );

  content = content.replace(
    '            </button>\n          </div>\n        </motion.div>\n      </div>',
    '            </button>\n          </div>\n          </FormProvider>\n        </motion.div>\n      </div>'
  );
}

// 4. Substituir a seção Equipamento
const startMarker = '{/* Equipamento */}';
const endMarker = '{/* Problema e Análise */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);
  
  const componentStr = `{/* Equipamento Componentizado */}
            <EquipmentSection 
              skipEquipmentValidation={skipEquipmentValidation}
              setSkipEquipmentValidation={setSkipEquipmentValidation}
              isSimplified={isSimplified}
              equipmentTypes={equipmentTypes}
              brands={brands}
              models={models}
              onAddEquipmentType={onAddEquipmentType}
              onAddBrand={onAddBrand}
              onAddModel={onAddModel}
              setQuickAddModal={setQuickAddModal}
              showToast={showToast}
              watchedArrivalPhotos={watchedArrivalPhotos}
              addPhoto={addPhoto}
              removePhoto={removePhoto}
            />

            `;
            
  fs.writeFileSync(filePath, before + componentStr + after);
  console.log('Refatoração Equipamento aplicada com sucesso!');
} else {
  console.error('Markers não encontrados!', { startIndex, endIndex });
}
