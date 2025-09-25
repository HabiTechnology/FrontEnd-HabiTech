#!/usr/bin/env node

/**
 * 🔒 HABITECH SECURITY CHECKER
 * 
 * Script para verificar configuraciones de seguridad
 * Ejecutar antes de deployment
 */

const fs = require('fs')
const path = require('path')

console.log('🔒 HABITECH - Verificador de Seguridad\n')

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
}

function log(type, message, details = '') {
  const icons = { 
    success: '✅', 
    error: '❌', 
    warning: '⚠️', 
    info: 'ℹ️' 
  }
  console.log(`${icons[type]} ${message}`)
  if (details) console.log(`   ${details}`)
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('success', `${description} - OK`)
    checks.passed++
    return true
  } else {
    log('error', `${description} - FALTA`)
    checks.failed++
    return false
  }
}

function checkEnvExample() {
  console.log('\n📋 Verificando configuración de variables de entorno...')
  
  // Verificar archivo .env existente
  if (fs.existsSync('.env')) {
    log('success', 'Archivo .env encontrado - OK')
    checks.passed++
  } else {
    log('warning', 'Archivo .env no encontrado - usar variables del sistema')
    checks.warnings++
  }
  
  // Verificar variables esenciales en .env si existe
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8')
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_PRIVY_APP_ID',
      'NEXT_PUBLIC_HABITECH_ACCESS_CONTRACT',
      'SESSION_SECRET',
      'JWT_SECRET'
    ]
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        log('success', `Variable ${varName} encontrada`)
        checks.passed++
      } else {
        log('warning', `Variable ${varName} no encontrada en .env`)
        checks.warnings++
      }
    })
  }
}

function checkSecurityFiles() {
  console.log('\n🛡️ Verificando archivos de seguridad...')
  
  const securityFiles = [
    ['middleware.ts', 'Middleware de seguridad'],
    ['lib/security-validation.ts', 'Validaciones de seguridad'],
    ['components/security/secure-route-guard.tsx', 'Componente de rutas seguras'],
    ['SECURITY.md', 'Documentación de seguridad']
  ]
  
  securityFiles.forEach(([file, desc]) => {
    checkFile(file, desc)
  })
}

function checkNextConfig() {
  console.log('\n⚙️ Verificando configuración de Next.js...')
  
  if (!checkFile('next.config.ts', 'Configuración Next.js')) return
  
  const configContent = fs.readFileSync('next.config.ts', 'utf8')
  
  const securityFeatures = [
    ['Strict-Transport-Security', 'HSTS Header'],
    ['X-XSS-Protection', 'XSS Protection'],
    ['X-Frame-Options', 'Clickjacking Protection'],
    ['Content-Security-Policy', 'CSP Header'],
    ['poweredByHeader: false', 'Powered-By Header oculto']
  ]
  
  securityFeatures.forEach(([feature, desc]) => {
    if (configContent.includes(feature)) {
      log('success', `${desc} configurado`)
      checks.passed++
    } else {
      log('warning', `${desc} no encontrado`)
      checks.warnings++
    }
  })
}

function checkPackageJson() {
  console.log('\n📦 Verificando dependencias de seguridad...')
  
  if (!checkFile('package.json', 'package.json')) return
  
  const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const deps = { ...packageContent.dependencies, ...packageContent.devDependencies }
  
  const securityDeps = [
    ['zod', 'Validación de esquemas'],
    ['@privy-io/react-auth', 'Autenticación blockchain'],
    ['bcrypt', 'Hash de passwords'],
    ['viem', 'Cliente Ethereum']
  ]
  
  securityDeps.forEach(([dep, desc]) => {
    if (deps[dep]) {
      log('success', `${desc} (${dep}) - v${deps[dep]}`)
      checks.passed++
    } else {
      log('warning', `${desc} (${dep}) no encontrado`)
      checks.warnings++
    }
  })
}

function checkHooks() {
  console.log('\n🎣 Verificando hooks de autenticación...')
  
  const hookFiles = [
    ['hooks/use-auth-integrated.ts', 'Hook de autenticación integrado'],
    ['hooks/use-habitech-contract.ts', 'Hook de contrato blockchain']
  ]
  
  hookFiles.forEach(([file, desc]) => {
    if (checkFile(file, desc)) {
      const content = fs.readFileSync(file, 'utf8')
      
      if (content.includes('generateSecureNonce')) {
        log('success', 'Generación de nonces segura')
        checks.passed++
      } else {
        log('warning', 'Generación de nonces no encontrada')
        checks.warnings++
      }
      
      if (content.includes('validateSession')) {
        log('success', 'Validación de sesión implementada')
        checks.passed++
      } else {
        log('warning', 'Validación de sesión no encontrada')
        checks.warnings++
      }
    }
  })
}

function checkAPIs() {
  console.log('\n🌐 Verificando APIs de ejemplo...')
  
  const apiFiles = [
    'app/api/departamentos/route.ts',
    'app/api/residentes/route.ts', 
    'app/api/solicitudes-renta/route.ts'
  ]
  
  apiFiles.forEach(apiFile => {
    if (fs.existsSync(apiFile)) {
      const content = fs.readFileSync(apiFile, 'utf8')
      
      if (content.includes('validateApiInput')) {
        log('success', `API ${apiFile} - Validación implementada`)
        checks.passed++
      } else {
        log('warning', `API ${apiFile} - Sin validación robusta`)
        checks.warnings++
      }
      
      if (content.includes('sanitizeQueryParams')) {
        log('success', `API ${apiFile} - Sanitización implementada`)
        checks.passed++
      } else {
        log('warning', `API ${apiFile} - Sin sanitización`)
        checks.warnings++
      }
    } else {
      log('info', `API ${apiFile} - No encontrada (opcional)`)
    }
  })
}

function checkGitignore() {
  console.log('\n🙈 Verificando .gitignore...')
  
  if (!checkFile('.gitignore', '.gitignore')) return
  
  const gitignoreContent = fs.readFileSync('.gitignore', 'utf8')
  
  const sensitiveFiles = ['.env', '.env.local', '.env.production', 'secrets/']
  
  sensitiveFiles.forEach(file => {
    if (gitignoreContent.includes(file)) {
      log('success', `${file} está en .gitignore`)
      checks.passed++
    } else {
      log('error', `${file} NO está en .gitignore - CRÍTICO`)
      checks.failed++
    }
  })
}

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESUMEN DE SEGURIDAD')
  console.log('='.repeat(50))
  
  log('success', `Verificaciones exitosas: ${checks.passed}`)
  
  if (checks.warnings > 0) {
    log('warning', `Advertencias: ${checks.warnings}`)
  }
  
  if (checks.failed > 0) {
    log('error', `Fallos críticos: ${checks.failed}`)
  }
  
  console.log('')
  
  const total = checks.passed + checks.warnings + checks.failed
  const successRate = ((checks.passed / total) * 100).toFixed(1)
  
  if (checks.failed === 0 && checks.warnings <= 2) {
    log('success', `✨ SEGURIDAD EXCELENTE (${successRate}%)`)
    console.log('   La aplicación está lista para producción.')
  } else if (checks.failed === 0) {
    log('warning', `⚠️ SEGURIDAD BUENA (${successRate}%)`)
    console.log('   Revisar advertencias antes de producción.')
  } else {
    log('error', `🚨 SEGURIDAD INSUFICIENTE (${successRate}%)`)
    console.log('   CORREGIR FALLOS CRÍTICOS antes de deployment.')
  }
  
  console.log('')
  console.log('📖 Ver SECURITY.md para más detalles')
  console.log('🔧 Configurar variables en .env según .env.example')
  
  if (checks.failed > 0) {
    process.exit(1) // Exit con error si hay fallos críticos
  }
}

// Ejecutar todas las verificaciones
console.log('Iniciando verificaciones de seguridad...\n')

checkEnvExample()
checkSecurityFiles()  
checkNextConfig()
checkPackageJson()
checkHooks()
checkAPIs()
checkGitignore()
printSummary()