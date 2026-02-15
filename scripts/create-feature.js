#!/usr/bin/env node

// scripts/create-feature.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURES_DIR = path.join(__dirname, '../src/features');

async function createFeature() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'featureName',
        message: 'Masukkan nama feature:',
        validate: (input) => {
          if (!input) {
            return 'Nama feature tidak boleh kosong!';
          }
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Nama feature harus lowercase dan tanpa spasi (gunakan dash -)';
          }
          return true;
        },
      },
      {
        type: 'checkbox',
        name: 'files',
        message: 'Pilih file yang ingin dibuat:',
        choices: [
          { name: 'Component (.tsx)', value: 'component', checked: true },
          { name: 'Types (.types.ts)', value: 'types' },
          { name: 'Hooks (.hooks.ts)', value: 'hooks' },
          { name: 'Utils (.utils.ts)', value: 'utils' },
          { name: 'API (.api.ts)', value: 'api' },
        ],
      },
    ]);

    const { featureName, files } = answers;
    const featurePath = path.join(FEATURES_DIR, featureName);
    
    // Cek apakah feature sudah ada
    if (fs.existsSync(featurePath)) {
      console.error(chalk.red(`Error: Feature '${featureName}' sudah ada!`));
      process.exit(1);
    }

    // Capitalize untuk component name (dashboard -> Dashboard)
    const componentName = featureName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    // Buat folder utama feature
    fs.mkdirSync(featurePath, { recursive: true });
    console.log(chalk.green(`Folder created: src/features/${featureName}`));

    // Buat folder components jika ada
    if (files.includes('component')) {
      const componentsPath = path.join(featurePath, 'components');
      fs.mkdirSync(componentsPath, { recursive: true });
      console.log(chalk.green(`Folder created: src/features/${featureName}/components`));

      // Template component
      const componentTemplate = `export const ${componentName} = () => {
  return (
    <div>
      <h1>${componentName}</h1>
      <p>Welcome to ${featureName} feature</p>
    </div>
  );
}
`;

      // Buat file component
      const componentFilePath = path.join(componentsPath, `${featureName}.tsx`);
      fs.writeFileSync(componentFilePath, componentTemplate);
      console.log(chalk.green(`File created: src/features/${featureName}/components/${featureName}.tsx`));
    }

    // Template untuk file lainnya
    const templates = {
      types: {
        filename: `${featureName}.types.ts`,
        content: `export interface ${componentName}Props {
  // Add your props here
}

export interface ${componentName}Data {
  // Add your data types here
}
`,
      },
      hooks: {
        filename: `${featureName}.hooks.ts`,
        content: `import { useState } from 'react';

export function use${componentName}() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Add your hook logic here

  return {
    data,
    isLoading,
    error,
  };
}
`,
      },
      utils: {
        filename: `${featureName}.utils.ts`,
        content: `/**
 * Utility functions for ${featureName} feature
 */

export function format${componentName}Data(data: any) {
  // Add your utility logic here
  return data;
}
`,
      },
      api: {
        filename: `${featureName}.api.ts`,
        content: `/**
 * API functions for ${featureName} feature
 */

export async function fetch${componentName}Data() {
  // Add your API calls here
  const response = await fetch('/api/${featureName}');
  return response.json();
}

export async function create${componentName}(data: any) {
  const response = await fetch('/api/${featureName}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
`,
      },
    };

    // Buat file yang dipilih (selain component)
    files.forEach(fileType => {
      if (fileType === 'component') return; // Skip, sudah dibuat di atas

      const template = templates[fileType];
      const filePath = path.join(featurePath, template.filename);
      fs.writeFileSync(filePath, template.content);
      console.log(chalk.green(`File created: src/features/${featureName}/${template.filename}`));
    });

    // Buat index.ts (barrel export)
    let indexContent = '';

    if (files.includes('component')) {
      indexContent += `export { ${componentName} } from './components/${featureName}';\n`;
    }

    files.forEach(fileType => {
      if (fileType === 'component') return;
      indexContent += `export * from './${featureName}.${fileType}';\n`;
    });

    const indexFilePath = path.join(featurePath, 'index.ts');
    fs.writeFileSync(indexFilePath, indexContent);
    console.log(chalk.green(`File created: src/features/${featureName}/index.ts`));

    console.log(chalk.blue('\nFeature berhasil dibuat!'));
    console.log(chalk.gray(`src/features/${featureName}/`));
    if (files.includes('component')) {
      console.log(chalk.gray(`├── components/`));
      console.log(chalk.gray(`│   └── ${featureName}.tsx`));
    }
    console.log(chalk.gray(`├── index.ts`));
    files.forEach(fileType => {
      if (fileType !== 'component') {
        console.log(chalk.gray(`└── ${featureName}.${fileType}.ts`));
      }
    });

  } catch (error) {
    if (error.isTtyError) {
      console.error(chalk.red('Prompt tidak bisa di-render di environment ini'));
    } else {
      console.error(chalk.red('Error:', error.message));
    }
    process.exit(1);
  }
}

createFeature();