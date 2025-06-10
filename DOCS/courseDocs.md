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
    "id": 1,
    "title": "Matemáticas Básicas",
    "short_description": "Curso introductorio de matemáticas",
    "image_url": "https://example.com/math.jpg",
    "user_role_in_course": "teacher"
  },
  {
    "id": 2,
    "title": "Historia Universal",
    "short_description": "Recorrido por la historia mundial",
    "image_url": "https://example.com/history.jpg",
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

**Notas importantes:**

- El endpoint devuelve cursos donde el usuario es **profesor** (teacher_id = user.id) o **estudiante** (enrollment)
- El campo `user_role_in_course` indica si el usuario es "teacher" o "student" en ese cursod
- Se requiere token de autenticación válido
- Si el usuario no tiene cursos, se retorna mensaje descriptivo con array vacío.

---
