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
  url.searchParams.set("dia", fecha);

  const resp = await fetch(url, {
    headers: authHeaders(),
  });

  if (!resp.ok) throw new Error((await resp.text()) || "No se pudieron cargar los horarios.");
  return resp.json();
}

// GET /api/Citas?estado=...
export async function getMisCitas({ estado } = {}) {
  const url = new URL(`${API_URL}/api/Citas`);
  if (estado && estado !== "Todos") url.searchParams.set("estado", estado);

  const resp = await fetch(url, {
    headers: authHeaders(),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// GET /api/Citas/{id}
export async function getCita(id) {
  const resp = await fetch(`${API_URL}/api/Citas/${id}`, {
    headers: authHeaders(),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// Alias por si lo estás usando en otro lado
export async function getCitaById(id) {
  return getCita(id);
}

// POST /api/Citas
export async function crearCita(payload) {
  // payload puede incluir fechaHora, tipoConsulta, notas, duracionMin,
  // y si quieres también observaciones/diagnostico/medicamentos
  const resp = await fetch(`${API_URL}/api/Citas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}

// PUT /api/Citas/{id}
export async function actualizarCita(id, payload) {
  const resp = await fetch(`${API_URL}/api/Citas/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload), // 👈 ya no filtramos campos
  });

  if (!resp.ok) throw new Error(await resp.text());
}

// DELETE /api/Citas/{id}
export async function cancelarCita(id) {
  const resp = await fetch(`${API_URL}/api/Citas/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!resp.ok) throw new Error(await resp.text());
}
