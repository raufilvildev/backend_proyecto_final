# COURSES

## GET /api/courses

**Descripción:** Obtener todos los cursos del usuario autenticado (como profesor o estudiante)  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:** Array de cursos donde el usuario participa  
**Códigos:** 200 (OK), 401 (Token inválido), 500 (Error del servidor)

**Ejemplo de respuesta exitosa:**

```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Matemáticas Básicas",
    "short_description": "Curso introductorio de matemáticas",
    "image_url": "https://example.com/math.jpg",
    "teacher": "Juan Pérez",
    "user_role_in_course": "teacher"
  },
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Historia Universal",
    "short_description": "Recorrido por la historia mundial",
    "image_url": "https://example.com/history.jpg",
    "teacher": "María García",
    "user_role_in_course": "student"
  }
]
```

**Ejemplo de respuesta sin cursos:**

```json
{
  "message": "No tienes cursos asignados",
  "courses": []
}
```

**Campos de respuesta:**

- `uuid`: Identificador único del curso (UUID)
- `title`: Título del curso
- `short_description`: Descripción breve del curso
- `image_url`: URL de la imagen del curso
- `teacher`: Nombre completo del profesor (first_name + last_name)
- `user_role_in_course`: Rol del usuario en el curso ("teacher" o "student")

**Notas importantes:**

- El endpoint devuelve cursos donde el usuario es **profesor** (teacher_id = user.id) o **estudiante** (enrollment)
- El campo `user_role_in_course` indica si el usuario es "teacher" o "student" en ese curso
- El campo `teacher` siempre muestra el nombre del profesor del curso, concatenando first_name y last_name
- Se utiliza `uuid` en lugar de `id` para mayor seguridad
- Se requiere token de autenticación válido
- Si el usuario no tiene cursos, se retorna mensaje descriptivo con array vacío

---
