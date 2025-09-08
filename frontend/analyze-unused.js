#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Analizor pentru componentele nefolosite
class UnusedComponentsAnalyzer {
  constructor(srcPath) {
    this.srcPath = srcPath;
    this.imports = new Map();
    this.exports = new Map();
    this.componentFiles = new Set();
    this.usedComponents = new Set();
  }

  // Găsește toate fișierele de componente
  findComponentFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.findComponentFiles(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        this.componentFiles.add(filePath);
      }
    }
  }

  // Analizează importurile dintr-un fișier
  analyzeImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Regex pentru import statements
      const importRegex = /import\s+(?:{[^}]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
      const relativeImportRegex = /import\s+(?:{[^}]*}|\w+|\*\s+as\s+\w+)\s+from\s+['"]\.\.?\/[^'"]*['"]/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Ignoră importurile externe (node_modules)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          continue;
        }
        
        // Resolvează calea relativă
        const resolvedPath = this.resolveImportPath(filePath, importPath);
        if (resolvedPath) {
          this.imports.set(filePath, [...(this.imports.get(filePath) || []), resolvedPath]);
        }
      }
    } catch (error) {
      console.warn(`Eroare la analizarea ${filePath}:`, error.message);
    }
  }

  // Resolvează calea de import relativă
  resolveImportPath(fromFile, importPath) {
    const fromDir = path.dirname(fromFile);
    let resolvedPath;
    
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      resolvedPath = path.resolve(fromDir, importPath);
    } else if (importPath.startsWith('~/')) {
      resolvedPath = path.resolve(this.srcPath, importPath.substring(2));
    } else {
      return null;
    }
    
    // Încearcă diferite extensii
    const extensions = ['.tsx', '.ts', '/index.tsx', '/index.ts'];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    return resolvedPath;
  }

  // Analizează exporturile dintr-un fișier
  analyzeExports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Regex pentru export statements
      const exportRegex = /export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+(\w+)/g;
      const exportFromRegex = /export\s*{\s*([^}]+)\s*}/g;
      
      let match;
      const exports = [];
      
      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }
      
      while ((match = exportFromRegex.exec(content)) !== null) {
        const exportList = match[1].split(',').map(exp => exp.trim().split(' as ')[0]);
        exports.push(...exportList);
      }
      
      if (exports.length > 0) {
        this.exports.set(filePath, exports);
      }
    } catch (error) {
      console.warn(`Eroare la analizarea exporturilor din ${filePath}:`, error.message);
    }
  }

  // Marchează componentele ca fiind folosite
  markUsedComponents(filePath) {
    this.usedComponents.add(filePath);
    
    const imports = this.imports.get(filePath) || [];
    for (const importPath of imports) {
      if (!this.usedComponents.has(importPath)) {
        this.markUsedComponents(importPath);
      }
    }
  }

  // Analizează toate fișierele
  analyze() {
    console.log('🔍 Analizez componentele...');
    
    // Găsește toate fișierele de componente
    this.findComponentFiles(this.srcPath);
    console.log(`📁 Găsite ${this.componentFiles.size} fișiere de componente`);
    
    // Analizează importurile și exporturile
    for (const filePath of this.componentFiles) {
      this.analyzeImports(filePath);
      this.analyzeExports(filePath);
    }
    
    // Marchează componentele folosite din punctele de intrare
    const entryPoints = [
      path.join(this.srcPath, 'App.jsx'),
      path.join(this.srcPath, 'main.jsx'),
      path.join(this.srcPath, 'routes'),
    ];
    
    for (const entryPoint of entryPoints) {
      if (fs.existsSync(entryPoint)) {
        if (fs.statSync(entryPoint).isDirectory()) {
          this.findComponentFiles(entryPoint);
          for (const file of this.componentFiles) {
            if (file.startsWith(entryPoint)) {
              this.markUsedComponents(file);
            }
          }
        } else {
          this.markUsedComponents(entryPoint);
        }
      }
    }
    
    // Calculează componentele nefolosite
    const unusedComponents = [];
    for (const filePath of this.componentFiles) {
      if (!this.usedComponents.has(filePath)) {
        unusedComponents.push(filePath);
      }
    }
    
    return {
      total: this.componentFiles.size,
      used: this.usedComponents.size,
      unused: unusedComponents.length,
      unusedComponents: unusedComponents.sort()
    };
  }

  // Generează raportul
  generateReport(results) {
    console.log('\n📊 RAPORT ANALIZĂ COMPONENTE:');
    console.log('='.repeat(50));
    console.log(`📁 Total componente: ${results.total}`);
    console.log(`✅ Componente folosite: ${results.used}`);
    console.log(`❌ Componente nefolosite: ${results.unused}`);
    console.log(`📈 Procent folosit: ${((results.used / results.total) * 100).toFixed(1)}%`);
    
    if (results.unusedComponents.length > 0) {
      console.log('\n🗑️  COMPONENTE NEFOLOSITE:');
      console.log('-'.repeat(30));
      
      // Grupează după director
      const grouped = {};
      for (const file of results.unusedComponents) {
        const dir = path.dirname(file).replace(this.srcPath, '');
        if (!grouped[dir]) {
          grouped[dir] = [];
        }
        grouped[dir].push(path.basename(file));
      }
      
      for (const [dir, files] of Object.entries(grouped)) {
        console.log(`\n📂 ${dir || '/src'}:`);
        files.forEach(file => console.log(`   - ${file}`));
      }
    }
    
    console.log('\n💡 RECOMANDĂRI:');
    console.log('-'.repeat(20));
    console.log('1. Verifică manual componentele marcate ca nefolosite');
    console.log('2. Unele pot fi folosite dinamic sau prin string-uri');
    console.log('3. Păstrează componentele de bază (UI primitives)');
    console.log('4. Șterge componentele specifice unei funcționalități dezactivate');
  }
}

// Rulează analiza
const analyzer = new UnusedComponentsAnalyzer('./src');
const results = analyzer.analyze();
analyzer.generateReport(results);
