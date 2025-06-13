# FORUM

## GET /api/forum/:courseUuid

**Descripción:** Obtener todos los hilos de discusión de un curso específico, incluyendo la información del autor de cada hilo y todas sus respuestas con sus respectivos autores.
**Headers:** `Authorization: Bearer <token>`
**Parámetros de URL:**
  - `courseUuid` (string, requerido): El UUID del curso para el cual se quieren obtener los hilos del foro.
**Parámetros de Query (Opcional):**
  - `order` (string, opcional): Define el orden de los hilos. Valores posibles: "asc" (ascendente) o "desc" (descendente). Por defecto es "desc".
**Respuesta:**
  - Si se encuentran hilos: Array de objetos `thread`. Cada objeto `thread` incluye:
    - `uuid`: UUID del hilo.
    - `user`: Objeto con la información del autor del hilo (`uuid`, `first_name`, `last_name`, `profile_image_url`, `role`).
    - `title`: Título del hilo.
    - `content`: Contenido del hilo.
    - `created_at`: Fecha de creación del hilo.
    - `updated_at`: Fecha de última actualización del hilo.
    - `responses`: Array de objetos `reply`. Cada objeto `reply` incluye:
      - `uuid`: UUID de la respuesta.
      - `user`: Objeto con la información del autor de la respuesta (`uuid`, `first_name`, `last_name`, `profile_image_url`, `role`).
      - `content`: Contenido de la respuesta.
      - `created_at`: Fecha de creación de la respuesta.
      - `updated_at`: Fecha de última actualización de la respuesta.
    Ejemplo de un hilo en el array:
    ```json
    {
      "uuid": "thread-uuid-123",
      "user": {
        "uuid": "user-uuid-author",
        "first_name": "Ana",
        "last_name": "Pérez",
        "profile_image_url": "url_to_image.jpg",
        "role": "teacher"
      },
      "title": "Dudas sobre la Lección 3",
      "content": "Hola, tengo una duda sobre el material de la lección 3...",
      "created_at": "2025-06-13T10:00:00.000Z",
      "updated_at": "2025-06-13T10:00:00.000Z",
      "responses": [
        {
          "uuid": "reply-uuid-456",
          "user": {
            "uuid": "user-uuid-student",
            "first_name": "Carlos",
            "last_name": "Gómez",
            "profile_image_url": null,
            "role": "student"
          },
          "content": "Yo también tengo esa duda.",
          "created_at": "2025-06-13T11:00:00.000Z",
          "updated_at": "2025-06-13T11:00:00.000Z"
        }
      ]
    }
    ```
  - Si no se encuentran hilos para el curso:
    ```json
    {
      "message": "No hay hilos de discusión en este curso",
      "threads": [],
      "order": "desc" // o el valor de 'order' proporcionado
    }
    ```
  - Si no se proporciona `courseUuid`:
    ```json
    { "error": "Course UUID is required" }
    ```
**Códigos:** 200 (OK), 400 (Parámetro `courseUuid` requerido), 401 (Token inválido o ausente), 500 (Error del servidor)

---