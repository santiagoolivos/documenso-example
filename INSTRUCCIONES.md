# Instrucciones de Uso - Documenso Template Builder

## 🚀 Inicio Rápido

### 1. Configurar la API Key de Documenso

El archivo `.env.local` ya está creado. Solo necesitas actualizar tu API key:

```bash
DOCUMENSO_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_DOCUMENSO_HOST=https://app.documenso.com
```

**¿Cómo obtener tu API Key?**
1. Ve a [Documenso](https://app.documenso.com)
2. Inicia sesión o crea una cuenta
3. Ve a Settings → API Keys
4. Crea una nueva API key
5. Cópiala y pégala en el archivo `.env.local`

### 2. Iniciar la Aplicación

```bash
cd "/Users/santiagoolivos/Desktop/Trabajo/SignatureApi/external-projects/documenso-platform"
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## 📋 Cómo Usar la Plataforma

### Paso 1: Subir un PDF
1. Abre http://localhost:3000
2. Arrastra un archivo PDF o haz clic para seleccionarlo
3. Espera a que se complete la carga
4. Haz clic en "Continue to Template Builder"

### Paso 2: Crear el Template
1. **Agregar Campos**: Haz clic en los botones de tipo de campo (Signature, Date, Name, Email, Text)
2. **Posicionar Campos**: Arrastra los campos sobre el PDF para posicionarlos
3. **Redimensionar**: Arrastra desde la esquina inferior derecha para cambiar el tamaño
4. **Eliminar**: Haz clic en la X para eliminar un campo

### Paso 3: Agregar Destinatarios (Recipients)
1. En el panel izquierdo, completa el formulario de destinatarios
2. Ingresa el nombre y email de cada firmante
3. Haz clic en "Add Recipient"
4. Puedes agregar múltiples destinatarios

### Paso 4: Guardar y Enviar a Firmar
1. Haz clic en "Save & Continue"
2. El template se creará en Documenso
3. Se generará un token de firma
4. Se cargará la interfaz de firma embebida

## 🏗️ Estructura del Proyecto

```
documenso-platform/
├── app/
│   ├── page.tsx                    # Página principal (subir PDF)
│   ├── template-builder/           # Constructor de templates
│   │   └── page.tsx
│   ├── sign/                       # Página de firma embebida
│   │   └── page.tsx
│   └── api/                        # API Routes (backend seguro)
│       └── documenso/
│           ├── upload/             # Subir PDF
│           └── template/           # Crear template, campos, recipients, token
├── components/                     # Componentes React
│   ├── PDFUpload.tsx              # Componente de carga
│   ├── PDFViewer.tsx              # Visor de PDF con campos
│   ├── FieldToolbar.tsx           # Barra de herramientas de campos
│   ├── DraggableField.tsx         # Campo arrastrable
│   └── RecipientForm.tsx          # Formulario de destinatarios
├── types/
│   └── index.ts                   # Tipos TypeScript
└── .env.local                     # Variables de entorno (API Key)
```

## 🔧 Características Implementadas

✅ **Upload de PDF**: Drag & drop con react-dropzone
✅ **Template Builder Personalizado**: Interfaz drag-and-drop completa
✅ **Tipos de Campos**: Signature, Date, Name, Email, Text
✅ **Multi-Recipient**: Soporte para múltiples firmantes
✅ **API Routes Seguras**: La API key nunca se expone al cliente
✅ **Embedded Signing**: Integración con @documenso/embed-react
✅ **Responsive**: Diseño adaptable a diferentes pantallas

## 🎨 Tipos de Campos Disponibles

| Campo | Descripción | Color |
|-------|-------------|-------|
| **Signature** | Campo de firma digital | Azul |
| **Date** | Campo de fecha | Verde |
| **Name** | Campo de nombre | Púrpura |
| **Email** | Campo de correo electrónico | Naranja |
| **Text** | Campo de texto libre | Gris |

## 🔄 Flujo de la Aplicación

```
1. Upload PDF
   ↓
2. Template Builder
   - Agregar campos (drag & drop)
   - Posicionar y redimensionar
   - Agregar recipients
   ↓
3. Guardar Template
   - Crear template en Documenso
   - Agregar recipients
   - Agregar campos con coordenadas
   - Generar token de firma
   ↓
4. Embedded Signing
   - Cargar interfaz de Documenso
   - Firmar documento
   - Completar proceso
```

## 🛠️ Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar código (linting)
npm run lint
```

## 🐛 Solución de Problemas

### Error: "API key not configured"
- Verifica que `.env.local` existe y contiene tu API key
- Reinicia el servidor después de cambiar `.env.local`

### El PDF no se muestra
- Limpia la caché del navegador
- Verifica la consola del navegador para errores
- Asegúrate de tener conexión a internet (el worker de PDF.js se carga desde CDN)

### No puedo guardar el template
- Verifica que hayas agregado al menos un campo
- Verifica que hayas agregado al menos un destinatario
- Revisa la consola del navegador y los logs del servidor

### Error de build
Si encuentras errores al hacer `npm run build`:
```bash
# Limpia el build anterior
rm -rf .next
npm run build
```

## 📚 Tecnologías Utilizadas

- **Next.js 15+** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **react-pdf** - Renderizado de PDFs
- **react-dropzone** - Upload de archivos
- **@documenso/embed-react** - Componente de firma embebido
- **@documenso/sdk-typescript** - SDK de Documenso
- **lucide-react** - Iconos

## 🔗 Enlaces Útiles

- [Documentación de Documenso](https://docs.documenso.com)
- [API Reference de Documenso](https://openapi.documenso.com/reference)
- [Documentación de Next.js](https://nextjs.org/docs)
- [React PDF](https://react-pdf.org/)

## 📝 Notas Importantes

1. **Seguridad**: La API key se maneja solo en el servidor (API routes), nunca se expone al cliente
2. **Session Storage**: Los datos temporales se almacenan en sessionStorage durante el flujo
3. **Sin Autenticación**: Esta es una versión demo sin sistema de autenticación de usuarios
4. **PDF.js Worker**: Se carga desde CDN (unpkg.com) automáticamente

## 🎯 Próximos Pasos (Posibles Mejoras)

- [ ] Agregar autenticación de usuarios
- [ ] Persistir templates en una base de datos
- [ ] Permitir editar templates existentes
- [ ] Agregar más tipos de campos personalizados
- [ ] Implementar preview antes de enviar
- [ ] Agregar historial de documentos firmados
- [ ] Notificaciones por email
- [ ] Dashboard de estadísticas

## 💡 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Revisa este archivo de instrucciones
2. Consulta el archivo `SETUP.md`
3. Lee el `README.md` para más detalles técnicos
4. Revisa la documentación de Documenso

