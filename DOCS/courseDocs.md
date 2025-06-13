# COURSES

## GET /api/courses

**Descripción:** Obtener todos los cursos del usuario autenticado (como profesor o estudiante).
**Headers:** `Authorization: Bearer <token>`
**Respuesta:**
  - Si el usuario tiene cursos: Array de objetos curso. Cada objeto incluye `uuid`, `title`, `short_description` (descripción breve del curso), `image_url` (URL de la imagen del curso), y `teacher` (nombre completo del profesor).
  - Si el usuario no tiene cursos: Un objeto con un mensaje indicándolo, por ejemplo:
    ```json
    {
      "message": "No tienes cursos asignados",
      "courses": []
    }
    ```
**Códigos:** 200 (OK), 401 (Token inválido), 500 (Error del servidor)

---

## GET /api/courses/:courseUuid

**Descripción:** Obtener un curso específico por su UUID.
**Headers:** `Authorization: Bearer <token>`
**Parámetros de URL:**
  - `courseUuid` (string, requerido): El UUID del curso a obtener.
**Respuesta:**
  - Si se encuentra el curso: Objeto curso con `uuid`, `title`, `description` (descripción detallada del curso), `course_image_url`, y `teacher` (nombre completo del profesor). Ejemplo:
    ```json
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Nombre del Curso",
      "description": "Descripción detallada del curso...",
      "course_image_url": "https://example.com/image.jpg",
      "teacher": "Nombre ApellidoProfesor"
    }
    ```
  - Si no se proporciona `courseUuid`:
    ```json
    { "error": "Course UUID is required" }
    ```
  - Si el curso no se encuentra:
    ```json
    { "error": "Course not found" }
    ```
**Códigos:** 200 (OK), 400 (UUID del curso requerido), 401 (Token inválido), 404 (Curso no encontrado), 500 (Error del servidor)

---
