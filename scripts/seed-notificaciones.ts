import { neon } from '@neondatabase/serverless';import { neon } from '@neondatabase/serverless';



const sql = neon(process.env.DATABASE_URL!);const sql = neon(process.env.DATABASE_URL!);



async function seedNotificaciones() {async function seedNotificaciones() {

  console.log('Creando notificaciones de prueba...');  console.log(' Creando notificaciones de prueba...');



  const notificaciones = [  const notificaciones = [

    {    {

      usuario_id: 1,      usuario_id: 1,

      titulo: 'Pago de renta recibido',      titulo: 'Pago de renta recibido',

      mensaje: 'Tu pago de renta de 15000 ha sido procesado exitosamente',      mensaje: 'Tu pago de renta de ,000 ha sido procesado exitosamente',

      tipo: 'pago',      tipo: 'pago',

      icono: 'dollar-sign',      icono: 'dollar-sign',

      url_accion: '/financiero',      url_accion: '/financiero',

      leido: false      leido: false

    },    },

    {    {

      usuario_id: 1,      usuario_id: 1,

      titulo: 'Mantenimiento programado',      titulo: 'Mantenimiento programado',

      mensaje: 'Mantenimiento de elevadores el proximo lunes de 9:00 a 12:00',      mensaje: 'Mantenimiento de elevadores el próximo lunes de 9:00 a 12:00',

      tipo: 'mantenimiento',      tipo: 'mantenimiento',

      icono: 'wrench',      icono: 'wrench',

      url_accion: '/notificaciones',      url_accion: '/notificaciones',

      leido: false      leido: false

    },    },

    {    {

      usuario_id: 1,      usuario_id: 1,

      titulo: 'Nueva solicitud pendiente',      titulo: 'Nueva solicitud pendiente',

      mensaje: 'Tienes una solicitud de mudanza pendiente de aprobacion',      mensaje: 'Tienes una solicitud de mudanza pendiente de aprobación',

      tipo: 'solicitud',      tipo: 'solicitud',

      icono: 'file-text',      icono: 'file-text',

      url_accion: '/solicitudes',      url_accion: '/solicitudes',

      leido: false      leido: false

    },    },

    {    {

      usuario_id: 1,      usuario_id: 1,

      titulo: 'Actualizacion del sistema',      titulo: 'Actualización del sistema',

      mensaje: 'El sistema se actualizara esta noche',      mensaje: 'El sistema se actualizará esta noche. Puede haber interrupciones menores',

      tipo: 'sistema',      tipo: 'sistema',

      icono: 'settings',      icono: 'settings',

      url_accion: '/notificaciones',      url_accion: '/notificaciones',

      leido: true      leido: true

    }    }

  ];  ];



  for (const notif of notificaciones) {  for (const notif of notificaciones) {

    try {    try {

      const result = await sql`      const result = await sql\

        INSERT INTO notificaciones (        INSERT INTO notificaciones (

          usuario_id, titulo, mensaje, tipo, icono, url_accion, leido          usuario_id, titulo, mensaje, tipo, icono, url_accion, leido

        ) VALUES (        ) VALUES (

          ${notif.usuario_id},          \,

          ${notif.titulo},          \,

          ${notif.mensaje},          \,

          ${notif.tipo},          \,

          ${notif.icono},          \,

          ${notif.url_accion},          \,

          ${notif.leido}          \

        )        )

        RETURNING *        RETURNING *

      `;      \;

      console.log('Notificacion creada:', result[0].titulo);      console.log(' Notificación creada:', result[0].titulo);

    } catch (error) {    } catch (error) {

      console.error('Error creando notificacion:', error);      console.error(' Error creando notificación:', error);

    }    }

  }  }



  console.log('Notificaciones de prueba creadas!');  console.log(' Notificaciones de prueba creadas!');

}}



seedNotificaciones().catch(console.error);seedNotificaciones().catch(console.error);

