# Credenciales de Usuarios - Égida Modelo de Ventas

## Total de Usuarios: 26

### Usuario Administrador (1)

| Usuario | Email | Contraseña | Rol |
|---------|-------|------------|-----|
| H4CH3D3V | admin@newman.com | NewmanTech* | admin |

---

### Usuarios Newman Bienes Raíces (25)

| # | Usuario | Email | Contraseña |
|---|---------|-------|------------|
| 001 | NWMNLJT61333 | new001@newman.com | Newman2025! |
| 002 | NWMNMBF6887 | new002@newman.com | Newman2025! |
| 003 | NWMNZAS44133 | new003@newman.com | Newman2025! |
| 004 | NWMNVPW0477 | new004@newman.com | Newman2025! |
| 005 | NWMNRQF5507 | new005@newman.com | Newman2025! |
| 006 | NWMNODR42233 | new006@newman.com | Newman2025! |
| 007 | NWMNVNR0807 | new007@newman.com | Newman2025! |
| 008 | NWMNWEX37722 | new008@newman.com | Newman2025! |
| 009 | NWMNREQ84611 | new009@newman.com | Newman2025! |
| 010 | NWMNQTV8917 | new010@newman.com | Newman2025! |
| 011 | NWMNUFV6997 | new011@newman.com | Newman2025! |
| 012 | NWMNQFN29611 | new012@newman.com | Newman2025! |
| 013 | NWMNMGX1487 | new013@newman.com | Newman2025! |
| 014 | NWMNIGD45213 | new014@newman.com | Newman2025! |
| 015 | NWMNJGP5847 | new015@newman.com | Newman2025! |
| 016 | NWMNYJC17211 | new016@newman.com | Newman2025! |
| 017 | NWMNAEV67922 | new017@newman.com | Newman2025! |
| 018 | NWMNUWR95911 | new018@newman.com | Newman2025! |
| 019 | NWMNBJO68113 | new019@newman.com | Newman2025! |
| 020 | NWMNNIY3627 | new020@newman.com | Newman2025! |
| 021 | NWMNKPX8841 | new021@newman.com | Newman2025! |
| 022 | NWMNZQR3392 | new022@newman.com | Newman2025! |
| 023 | NWMNLWT5573 | new023@newman.com | Newman2025! |
| 024 | NWMNHDY9924 | new024@newman.com | Newman2025! |
| 025 | NWMNFVB2215 | new025@newman.com | Newman2025! |

---

## Instrucciones de Inicialización

1. Visita `/admin/setup` después del despliegue
2. Haz clic en "Inicializar Usuarios"
3. El sistema creará todos los usuarios automáticamente usando Supabase Auth API
4. Cada usuario recibirá una notificación por Telegram

## Flujo de Primer Inicio de Sesión

Cuando un usuario inicia sesión por primera vez:

1. Ingresa con su **Usuario** y **Contraseña**
2. Es redirigido automáticamente a `/complete-profile`
3. Debe completar el formulario con:
   - **Nombre**
   - **Apellido**
   - **Teléfono** (formato: +52 999 123 4567)
   - **Edad** (18-100 años)
   - **Ciudad** (selección de ciudades principales de México)
4. Al completar el perfil, es redirigido al chat de Newman
5. Se envía una notificación por Telegram con la información del perfil completado

## Notas Importantes

- Todos los usuarios Newman tienen la contraseña: **Newman2025!**
- El administrador tiene la contraseña: **NewmanTech***
- Los usuarios deben completar su perfil antes de acceder al chat
- El sistema verifica automáticamente si el perfil está completo
- Se eliminó "Consejo Estoico/Modo Sargento" - solo existe Newman Bienes Raíces
\`\`\`

```typescript file="" isHidden
