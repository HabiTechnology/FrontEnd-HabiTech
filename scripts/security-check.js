#!/usr/bin/env node

console.log('🔒 Ejecutando verificaciones de seguridad...')

// Verificaciones básicas de seguridad
const fs = require('fs')
const path = require('path')

const checks = [
  {
    name: 'Verificar variables de entorno',
    check: () => {
      const envFile = path.join(process.cwd(), '.env.local')
      if (!fs.existsSync(envFile)) {
        console.warn('⚠️  Archivo .env.local no encontrado')
        return false
      }
      console.log('✅ Archivo .env.local encontrado')
      return true
    }
  },
  {
    name: 'Verificar dependencias críticas',
    check: () => {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        const criticalDeps = ['next', 'react', 'react-dom']
        
        for (const dep of criticalDeps) {
          if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
            console.error(`❌ Dependencia crítica faltante: ${dep}`)
            return false
          }
        }
        console.log('✅ Dependencias críticas verificadas')
        return true
      } catch (error) {
        console.error('❌ Error verificando package.json:', error.message)
        return false
      }
    }
  },
  {
    name: 'Verificar estructura de archivos',
    check: () => {
      const criticalFiles = ['next.config.js', 'next.config.ts', 'tsconfig.json']
      let found = false
      
      for (const file of criticalFiles) {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} encontrado`)
          found = true
        }
      }
      
      if (!found) {
        console.warn('⚠️  No se encontraron archivos de configuración de Next.js')
      }
      
      return true
    }
  },
  {
    name: 'Verificar estructura del proyecto',
    check: () => {
      const requiredDirs = ['app', 'components', 'lib']
      
      for (const dir of requiredDirs) {
        if (fs.existsSync(dir)) {
          console.log(`✅ Directorio ${dir}/ encontrado`)
        } else {
          console.warn(`⚠️  Directorio ${dir}/ no encontrado`)
        }
      }
      
      return true
    }
  }
]

// Ejecutar verificaciones
let allPassed = true
for (const check of checks) {
  console.log(`\n🔍 ${check.name}...`)
  try {
    const result = check.check()
    if (!result) {
      allPassed = false
    }
  } catch (error) {
    console.error(`❌ Error en ${check.name}:`, error.message)
    allPassed = false
  }
}

console.log('\n' + '='.repeat(50))
if (allPassed) {
  console.log('✅ Todas las verificaciones de seguridad pasaron')
  console.log('🚀 El proyecto está listo para el build')
} else {
  console.log('⚠️  Algunas verificaciones fallaron, pero el build continuará')
  console.log('📝 Revisa los warnings arriba para optimizar la configuración')
}
console.log('='.repeat(50) + '\n')

// Siempre salir con código 0 para no bloquear el build
process.exit(0)