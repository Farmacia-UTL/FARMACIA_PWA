// Archivo: app/build.gradle.kts

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    // 1. SOLUCIÓN: Mueve el plugin de App Distribution aquí si lo necesitas.
    // Si no tienes 'firebase-appdistribution-gradle' en tu libs.versions.toml,
    // puedes añadirlo manualmente o usar la versión hardcodeada.
    // Ejemplo: id("com.google.firebase.appdistribution") version "5.0.0" apply false
    // Si ya está en tu toml como `libs.plugins.firebase.appdistribution`, úsalo:
    // alias(libs.plugins.firebase.appdistribution)
}

android {
    namespace = "com.example.proye_1003"
    compileSdk = 36

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "META-INF/INDEX.LIST"
            // Si te vuelve a dar el error de DEPENDENCIES, descomenta la siguiente línea:
            // excludes += "META-INF/DEPENDENCIES"
        }
    }

    defaultConfig {
        applicationId = "com.example.proye_1003"
        minSdk = 24
        // 2. SOLUCIÓN: Actualiza targetSdk para que coincida con compileSdk
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // 3. SOLUCIÓN: Se eliminaron las dependencias duplicadas.
    // Ahora solo se usan las referencias del catálogo de versiones (libs).

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)

    // Dependencias de red y asincronía (ya no están duplicadas)
    implementation(libs.retrofit)
    implementation(libs.converter.gson)
    implementation(libs.kotlinx.coroutines.android)

    // 4. SOLUCIÓN: Se eliminó la dependencia incorrecta del plugin de Gradle.
    // implementation(libs.firebase.appdistribution.gradle) // <-- ¡ELIMINADA!

    // Dependencias de Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
