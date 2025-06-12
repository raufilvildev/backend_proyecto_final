# COURSES

## GET /api/courses

**Descripción:** Obtener todos los cursos del usuario autenticado (como profesor o estudiante)  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:** Array de cursos donde el usuario participa o mensaje si no tiene cursos  
**Códigos:** 200 (OK), 401 (Token inválido), 500 (Error del servidor)

**Ejemplo de respuesta exitosa:**

```json
[
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Matemáticas Básicas",
    "short_description": "Curso introductorio de matemáticas",
    "image_url": "https://example.com/math.jpg",
    "teacher": "Juan Pérez"
  },
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Historia Universal",
    "short_description": "Recorrido por la historia mundial",
    "image_url": "https://example.com/history.jpg",
    "teacher": "María García"
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

**Notas importantes:**

- El endpoint devuelve cursos donde el usuario es **profesor** (teacher_id = user.id) o **estudiante**
- Se utiliza `uuid` en lugar de `id` para mayor seguridad
- Se requiere token de autenticación válido
- Si el usuario no tiene cursos, se retorna mensaje descriptivo con array vacío

**Lógica de la consulta:**

1. **Primera parte del UNION:** Cursos donde el usuario es profesor
2. **Segunda parte del UNION:** Cursos donde el usuario está matriculado como estudiante
3. **Resultado:** Lista unificada sin duplicados de todos los cursos del usuario

---
