const API_URL = import.meta.env.VITE_API_URL || "https://api-farmacia.ngrok.app";

const authHeaders = (extra = {}) => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

// === SLOTS (GET /api/Citas/slots)
export async function getSlots({ fecha }) {
  const url = new URL(`${API_URL}/api/Citas/slots`);
  url.searchParams.set("dia", fecha); // 👈 el backend espera 'dia'

  const resp = await fetch(url, {
    headers: authHeaders(),
    // SIN credentials aquí
  });

  if (!resp.ok) throw new Error(await resp.text() || "No se pudieron cargar los horarios.");
  return resp.json(); // [ { fechaHora, horaTexto, disponible }, ... ]
}

// GET /api/Citas?desde=&hasta=
export async function getMisCitas({ desde, hasta } = {}) {
  const url = new URL(`${API_URL}/api/Citas`);
  if (desde) url.searchParams.set("desde", desde);
  if (hasta) url.searchParams.set("hasta", hasta);

  const resp = await fetch(url, {
    headers: authHeaders(),
    // SIN credentials
  });

  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// GET /api/Citas/{id}
export async function getCita(id) {
  const resp = await fetch(`${API_URL}/api/Citas/${id}`, {
    headers: authHeaders(),
    // SIN credentials
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// POST /api/Citas
export async function crearCita({ fechaHora, tipoConsulta, notas, duracionMin }) {
  const resp = await fetch(`${API_URL}/api/Citas`, {
    method: "POST",
    headers: authHeaders(),
    // SIN credentials
    body: JSON.stringify({ fechaHora, tipoConsulta, notas, duracionMin }),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// PUT /api/Citas/{id}
export async function actualizarCita(id, { tipoConsulta, notas, estatus }) {
  const resp = await fetch(`${API_URL}/api/Citas/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    // SIN credentials
    body: JSON.stringify({ tipoConsulta, notas, estatus }),
  });

  if (!resp.ok) throw new Error(await resp.text());
}

// DELETE /api/Citas/{id}
export async function cancelarCita(id) {
  const resp = await fetch(`${API_URL}/api/Citas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
    // SIN credentials
  });

  if (!resp.ok) throw new Error(await resp.text());
}
