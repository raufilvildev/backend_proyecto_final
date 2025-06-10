# USER

## GET /api/user

**Descripción:** Obtener información del usuario autenticado  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:** Objeto usuario completo del token  
**Códigos:** 200 (OK), 401 (Token inválido)

---

## POST /api/user/signup

**Descripción:** Registrar nuevo usuario  
**Body requerido:**

```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "birth_date": "1990-01-15",
  "email": "juan@email.com",
  "username": "juanperez",
  "password": "password123",
  "role": "student"
}
```

**Respuesta:** Objeto usuario creado  
**Códigos:** 201 (Usuario creado), 400 (Datos inválidos), 409 (Usuario ya existe)

---

## POST /api/user/login

**Descripción:** Iniciar sesión de usuario  
**Body requerido:**

```json
{
  "username": "juanperez",
  "password": "password123"
}
```

**Respuesta:** Token de autenticación  
**Códigos:** 200 (Login exitoso), 401 (Credenciales inválidas)

---

## PUT /api/user

**Descripción:** Actualizar información del usuario autenticado  
**Headers:** `Authorization: Bearer <token>`  
**Body requerido:**

```json
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez García",
  "birth_date": "1990-01-15",
  "email": "juancarlos@email.com"
}
```

**Respuesta:** Objeto usuario actualizado  
**Códigos:** 200 (Usuario actualizado), 400 (Datos inválidos), 401 (Token inválido)

---

## DELETE /api/user

**Descripción:** Eliminar cuenta del usuario autenticado  
**Headers:** `Authorization: Bearer <token>`  
**Respuesta:** Mensaje de confirmación  
**Códigos:** 200 (Usuario eliminado), 401 (Token inválido)
