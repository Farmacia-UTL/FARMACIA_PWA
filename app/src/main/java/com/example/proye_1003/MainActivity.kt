package com.example.proye_1003

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    // Estado simple para navegar entre pantallas + mensaje pendiente para mostrar en login
                    var currentScreen by remember { mutableStateOf("login") }
                    var pendingMessage by remember { mutableStateOf<String?>(null) }

                    when (currentScreen) {
                        "login" -> LoginScreen(
                            onNavigateToRegister = { currentScreen = "register" },
                            initialMessage = pendingMessage,
                            onMessageShown = { pendingMessage = null }
                        )
                        "register" -> RegisterScreen(
                            onRegisterSuccess = { msg ->
                                pendingMessage = msg
                                currentScreen = "login"
                            },
                            onBack = { currentScreen = "login" }
                        )
                    }
                }
            }
        }
    }
}

// LoginScreen ahora con parámetro de navegación y soporte para mensaje inicial
@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    initialMessage: String? = null,
    onMessageShown: () -> Unit = {}
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    // Snackbar state y scope
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // Si hay un mensaje pendiente (por ejemplo registro exitoso), mostrarlo al entrar
    LaunchedEffect(initialMessage) {
        initialMessage?.let {
            snackbarHostState.showSnackbar(it)
            onMessageShown()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        containerColor = Color.Transparent
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Fondo de imagen (detrás de todo) - zIndex baja
            Image(
                // **Nota:** Asegúrate de tener R.drawable.fondo_farmacia en tus recursos
                painter = painterResource(id = R.drawable.fondo_farmacia),
                contentDescription = "Fondo farmacia",
                modifier = Modifier
                    .matchParentSize()
                    .zIndex(0f),
                contentScale = ContentScale.Crop
            )

            // Scrim: capa semitransparente encima de la imagen para mejorar legibilidad
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .background(Color.Black.copy(alpha = 0.45f))
            )

            // Caja centrada con sombra y fondo más opaco
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .align(Alignment.Center)
                    .zIndex(1f)
                    .shadow(12.dp, RoundedCornerShape(20.dp))
                    .background(
                        color = Color.White.copy(alpha = 0.95f),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .padding(30.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Bienvenido a ",
                        color = Color.Black,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Farmacia",
                        color = Color(0xFF00C853),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(25.dp))

                    // Campo correo
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Correo electrónico") },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00C853),
                            focusedLabelColor = Color(0xFF00C853)
                        )
                    )

                    Spacer(modifier = Modifier.height(15.dp))

                    // Campo contraseña
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Contraseña") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00C853),
                            focusedLabelColor = Color(0xFF00C853)
                        )
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Botón iniciar sesión
                    Button(
                        onClick = {
                            // Validación simple: email contiene '@' y contraseña al menos 6 caracteres
                            val success = email.contains("@") && password.length >= 6
                            val message = if (success) "Inicio de sesión exitoso" else "Credenciales inválidas"
                            scope.launch {
                                snackbarHostState.showSnackbar(message)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        contentPadding = PaddingValues()
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(Color(0xFF00E676), Color(0xFF00C853))
                                    ),
                                    shape = RoundedCornerShape(10.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Iniciar sesión",
                                color = Color.White,
                                fontSize = 18.sp,
                                textAlign = TextAlign.Center
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Enlace a registro reintroducido
                    TextButton(onClick = { onNavigateToRegister() }) {
                        Text(text = "¿No tienes cuenta? Crear cuenta", color = Color(0xFF00C853))
                    }
                }
            }
        }
    }
}

// RegisterScreen: Barra superior (TopBar) eliminada
@Composable
fun RegisterScreen(onRegisterSuccess: (String) -> Unit, onBack: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    Scaffold(
        // ELIMINADA: La barra superior (topBar) se ha quitado de aquí.
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        containerColor = Color.Transparent
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            Image(
                painter = painterResource(id = R.drawable.fondo_farmacia),
                contentDescription = "Fondo farmacia",
                modifier = Modifier.matchParentSize().zIndex(0f),
                contentScale = ContentScale.Crop
            )

            Box(modifier = Modifier.matchParentSize().background(Color.Black.copy(alpha = 0.45f)))

            Box(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .align(Alignment.Center)
                    .zIndex(1f)
                    .shadow(12.dp, RoundedCornerShape(20.dp))
                    .background(color = Color.White.copy(alpha = 0.95f), shape = RoundedCornerShape(20.dp))
                    .padding(30.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    // Este es el título que ahora aparecerá en el centro
                    Text("Crea tu cuenta", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                    Spacer(modifier = Modifier.height(20.dp))

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Correo electrónico") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00C853),
                            focusedLabelColor = Color(0xFF00C853)
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Contraseña") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00C853),
                            focusedLabelColor = Color(0xFF00C853)
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = { Text("Confirmar contraseña") },
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00C853),
                            focusedLabelColor = Color(0xFF00C853)
                        )
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = {
                            val validEmail = email.contains("@")
                            val validPassword = password.length >= 6
                            val passwordsMatch = password == confirmPassword
                            val success = validEmail && validPassword && passwordsMatch

                            scope.launch {
                                if (success) {
                                    // Navegar al login y mostrar mensaje allí
                                    onRegisterSuccess("Registro exitoso")
                                } else {
                                    val msg = when {
                                        !validEmail -> "Correo inválido"
                                        !validPassword -> "La contraseña debe tener al menos 6 caracteres"
                                        !passwordsMatch -> "Las contraseñas no coinciden"
                                        else -> "Error en los datos"
                                    }
                                    snackbarHostState.showSnackbar(msg)
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        contentPadding = PaddingValues()
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(Color(0xFF00E676), Color(0xFF00C853))
                                    ),
                                    shape = RoundedCornerShape(10.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Registrar", color = Color.White, fontSize = 18.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    TextButton(onClick = { onBack() }) {
                        Text(text = "Volver al inicio de sesión", color = Color(0xFF00C853))
                    }
                }
            }
        }
    }
}