import{a as e,c as t,i as n,l as r,n as i,o as a,r as o,s,t as c,u as l}from"./kit.C_qGBzAe.js";var u=[{id:`licencia`,n:`Licencia de conducción`,d:`Renovación o primera vez`,min:25,req:[{t:`Documento de identidad`,must:!0},{t:`Certificado médico vigente`,must:!0,tip:`Lo expiden los centros de reconocimiento en el día.`},{t:`Recibo de pago de derechos`,must:!0,tip:`Puedes pagarlo en línea antes de la cita.`},{t:`Licencia anterior (si renuevas)`,must:!1}]},{id:`pasaporte`,n:`Pasaporte`,d:`Expedición ordinaria`,min:20,req:[{t:`Documento de identidad`,must:!0},{t:`Recibo de pago`,must:!0,tip:`El pago se valida en unos minutos.`},{t:`Pasaporte anterior`,must:!1}]},{id:`residencia`,n:`Certificado de residencia`,d:`Para trámites laborales o escolares`,min:10,req:[{t:`Documento de identidad`,must:!0},{t:`Recibo de servicio público`,must:!0,tip:`Sirve el de luz, agua o gas de los últimos 3 meses.`}]},{id:`predial`,n:`Paz y salvo predial`,d:`Impuesto de vivienda al día`,min:8,req:[{t:`Número del predio`,must:!0,tip:`Aparece en la factura del impuesto.`},{t:`Documento del propietario`,must:!0}]},{id:`registro`,n:`Copia de registro civil`,d:`Nacimiento, matrimonio o defunción`,min:12,req:[{t:`Documento de identidad`,must:!0},{t:`Datos del registro (fecha y lugar)`,must:!1}]}],d=[{id:`centro`,n:`Sede Centro`,a:`Cra. 7 # 18-40`,demand:`Demanda alta`,load:.7},{id:`norte`,n:`Sede Norte`,a:`Av. 19 # 120-10`,demand:`Demanda media`,load:.45},{id:`sur`,n:`Punto 186 · Sur`,a:`Cl. 40 Sur # 24-05`,demand:`Demanda baja`,load:.2}],f=[`08:00`,`08:30`,`09:00`,`09:30`,`10:00`,`10:30`,`11:00`,`11:30`,`14:00`,`14:30`,`15:00`,`15:30`],p={inicio:`inicio`,tramites:`tramites`,req:`tramites`,cita:`tramites`,confirmar:`tramites`,ticket:`citas`,citas:`citas`},m=e=>u.find(t=>t.id===e),h=e=>d.find(t=>t.id===e),g=e=>{let t=2166136261;for(let n of e)t=Math.imul(t^n.charCodeAt(0),16777619);return t>>>0},_=(e,t,n)=>g(e+t+n)%100/100<h(t).load*.7;function v(e=6){let t=[],n=new Date;for(n.setHours(12,0,0,0);t.length<e;)n.setDate(n.getDate()+1),n.getDay()!==0&&n.getDay()!==6&&t.push(new Date(n));return t}var y=e=>e.toISOString().slice(0,10),b=e=>new Date(`${e}T12:00:00`);a(`[data-app="fila"]`,a=>{let x=r(`fila`,()=>({turns:[],seq:213})),S=e=>a.querySelector(`[data-screen="${e}"]`),C=`inicio`,w=null,T=0,E=``,D=()=>x.get().turns.filter(e=>e.status===`activo`).sort((e,t)=>(e.date+e.slot).localeCompare(t.date+t.slot)),O=e=>{let t=structuredClone(x.get());e(t),x.set(t)};function k(e,t=!0){a.querySelectorAll(`.ascreen`).forEach(t=>{let n=t.dataset.screen===e;t.hidden=!n,t.classList.toggle(`is-in`,n)}),C=e,N(e),S(e).scrollTop=0,a.querySelectorAll(`[data-tab]`).forEach(t=>t.dataset.tab===p[e]?t.setAttribute(`aria-current`,`page`):t.removeAttribute(`aria-current`)),t&&n(S(e))}let A=(t,n,r)=>`
      <header class="ahead">
        ${r?`<button type="button" class="aback" data-act="back" data-to="${r}">${e(`back`)} Atrás</button>`:``}
        <span class="ahead__eyebrow">${t}</span>
        <h2 class="ahead__title" data-title>${n}</h2>
      </header>`,j=e=>`<div class="steps" aria-hidden="true">${[1,2,3].map(t=>`<i class="${t<=e?`is-done`:``}"></i>`).join(``)}</div>`;function M(e){return Math.max(1,Math.round(e.ahead*m(e.tramite).min*.3))}function N(t){let n=S(t),r=D(),s=a.querySelector(`[data-citas-count]`);if(s.hidden=!r.length,s.textContent=String(r.length),s.setAttribute(`aria-label`,`${r.length} turnos activos`),t===`inicio`){let t=r[0];n.innerHTML=`
          ${A(`Hoy · `+o.date(new Date),`Hola, Ana. <span class="serif">¿Qué hacemos hoy?</span>`)}
          ${t?`
            <article class="acard acard--solid hero-turn" aria-label="Tu próximo turno">
              <div class="tagline"><span class="abadge">${e(`clock`)} Próximo turno</span></div>
              <div class="hero-turn__code">${i(t.code)}</div>
              <div class="hero-turn__meta"><b>${i(m(t.tramite).n)}</b><span>${i(h(t.sede).n)} · ${o.date(b(t.date))} · ${t.slot}</span></div>
              <button type="button" class="abtn abtn--block" data-act="open-ticket" data-id="${t.id}" style="border-color:currentColor">Ver mi turno ${e(`next`)}</button>
            </article>`:`
            <article class="acard acard--ink" style="display:grid;gap:14px">
              <p style="font-size:20px;font-weight:700;line-height:1.2">Saca tu turno desde aquí y llega solo cuando sea tu hora.</p>
              <button type="button" class="abtn abtn--accent abtn--block" data-act="tab" data-to="tramites">${e(`plus`)} Sacar turno</button>
            </article>`}
          <div class="asec">
            <h3 class="asec__title">Trámites frecuentes</h3>
            <div class="arows">${u.slice(0,3).map(P).join(``)}</div>
          </div>
          <div class="asec">
            <h3 class="asec__title">Así te ayudamos</h3>
            <div class="arows">
              <div class="arow"><span class="arow__ico">${e(`bell`)}</span><span class="arow__txt"><span class="arow__t">Aviso cuando falten 3 turnos</span><span class="arow__d">Espera donde quieras, no en la sala.</span></span></div>
              <div class="arow"><span class="arow__ico">${e(`doc`)}</span><span class="arow__txt"><span class="arow__t">Requisitos antes de ir</span><span class="arow__d">Nadie se devuelve por un papel.</span></span></div>
            </div>
          </div>`}if(t===`tramites`&&(n.innerHTML=`
          ${A(`Paso 0 · Elige`,`Trámites`)}
          <label class="afield search"><span class="sr-only">Buscar trámite</span>${e(`search`)}<input type="search" data-search placeholder="Buscar: licencia, pasaporte…" value="${i(E)}" autocomplete="off" /></label>
          <p class="amuted" data-search-count aria-live="polite" style="margin-top:10px"></p>
          <div class="arows" data-tramite-list style="margin-top:6px"></div>`,F()),t===`req`&&w){let t=m(w.tramite),r=t.req.filter(e=>e.must&&!w.checks.includes(e.t));n.innerHTML=`
          ${A(`Paso 1 de 3 · Requisitos`,i(t.n),`tramites`)}
          ${j(1)}
          <p class="amuted" style="margin:14px 0 10px">Marca lo que ya tienes. Así sabes qué llevar y nadie te devuelve en la ventanilla.</p>
          <div role="group" aria-label="Requisitos de ${i(t.n)}">
            ${t.req.map((e,t)=>`
              <label class="check">
                <input type="checkbox" data-check="${i(e.t)}" ${w.checks.includes(e.t)?`checked`:``} aria-describedby="fila-req-${t}" />
                <span class="check__t"><span>${i(e.t)}</span><span class="must" id="fila-req-${t}">${e.must?`Obligatorio`:`Opcional`}</span></span>
              </label>`).join(``)}
          </div>
          <div data-req-err style="margin-top:16px">${w.showErr&&r.length?`
            <div class="err" role="alert" tabindex="-1">
              <span class="err__t">${e(`alert`)} ${r.length===1?`Te falta un requisito`:`Te faltan ${r.length} requisitos`}</span>
              <ul style="display:grid;gap:6px">${r.map(e=>`<li><b>${i(e.t)}.</b> ${i(e.tip??``)}</li>`).join(``)}</ul>
              <button type="button" class="alink" data-act="req-anyway">Continuar y llevarlo el día de la cita</button>
            </div>`:``}</div>
          <button type="button" class="abtn abtn--solid abtn--block" data-act="req-next" style="margin-top:16px">Continuar ${e(`next`)}</button>`}if(t===`cita`&&w){let t=v();w.date||(w.date=y(t[0])),n.innerHTML=`
          ${A(`Paso 2 de 3 · Cuándo y dónde`,`Sede y hora`,`req`)}
          ${j(2)}
          <div class="asec">
            <h3 class="asec__title" id="fila-sede-l">Sede</h3>
            <div class="opts" role="radiogroup" aria-labelledby="fila-sede-l">
              ${d.map(e=>`
                <button type="button" class="opt" role="radio" aria-checked="${w.sede===e.id}" data-act="sede" data-id="${e.id}" tabindex="${w.sede===e.id||!w.sede&&e===d[0]?0:-1}">
                  <span class="opt__radio" aria-hidden="true"></span>
                  <span class="opt__txt"><b>${e.n}</b><span class="amuted">${e.a} · ${e.demand}</span></span>
                </button>`).join(``)}
            </div>
          </div>
          <div class="asec">
            <h3 class="asec__title" id="fila-day-l">Día</h3>
            <div class="days" role="radiogroup" aria-labelledby="fila-day-l">
              ${t.map(e=>`<button type="button" class="day" role="radio" aria-checked="${w.date===y(e)}" data-act="day" data-id="${y(e)}" tabindex="${w.date===y(e)?0:-1}" aria-label="${o.date(e)}"><small>${o.weekday(e)}</small><b>${o.dayNum(e)}</b></button>`).join(``)}
            </div>
          </div>
          <div class="asec">
            <h3 class="asec__title" id="fila-slot-l">Hora${w.sede?``:` · elige primero una sede`}</h3>
            ${w.sede?`<div class="slots" role="radiogroup" aria-labelledby="fila-slot-l">
              ${f.map(e=>{let t=_(w.date,w.sede,e);return`<button type="button" class="slot" role="radio" aria-checked="${w.slot===e}" ${t?`aria-disabled="true"`:``} data-act="slot" data-id="${e}" tabindex="${w.slot===e?0:-1}" aria-label="${e}${t?`, sin cupo`:``}">${e}${t?`<small>Lleno</small>`:``}</button>`}).join(``)}
            </div>`:`<p class="amuted">Las horas libres dependen de la sede.</p>`}
          </div>
          <div style="margin-top:18px">${w.showErr&&(!w.sede||!w.slot)?`<div class="err" role="alert" tabindex="-1" data-cita-err><span class="err__t">${e(`alert`)} Falta ${w.sede?`elegir una hora`:`elegir una sede`}</span><span>Toca una opción arriba para seguir.</span></div>`:``}</div>
          <button type="button" class="abtn abtn--solid abtn--block" data-act="cita-next" style="margin-top:16px">Continuar ${e(`next`)}</button>`}if(t===`confirmar`&&w){let t=m(w.tramite),r=t.req.filter(e=>e.must&&!w.checks.includes(e.t));n.innerHTML=`
          ${A(`Paso 3 de 3 · Revisa`,`Confirma tu turno`,`cita`)}
          ${j(3)}
          <dl class="acard acard--ink sum" style="margin-top:16px">
            <div><dt>Trámite</dt><dd>${i(t.n)}</dd></div>
            <div><dt>Sede</dt><dd>${i(h(w.sede).n)}</dd></div>
            <div><dt>Día</dt><dd>${o.date(b(w.date))}</dd></div>
            <div><dt>Hora</dt><dd>${w.slot}</dd></div>
            <div><dt>Duración aprox.</dt><dd>${t.min} min</dd></div>
          </dl>
          ${r.length?`<p class="err" style="margin-top:12px"><span class="err__t">${e(`alert`)} Recuerda llevar</span>${r.map(e=>i(e.t)).join(`, `)}.</p>`:``}
          <div class="asec">
            <h3 class="asec__title">Avisos automáticos</h3>
            <label class="switch"><input type="checkbox" data-opt="remind" ${w.remind?`checked`:``} /><span>Recordarme un día antes</span></label>
            <label class="switch"><input type="checkbox" data-opt="near" ${w.near?`checked`:``} /><span>Avisarme cuando falten 3 turnos</span></label>
          </div>
          <button type="button" class="abtn abtn--accent abtn--block" data-act="confirm" style="margin-top:20px">${e(`check`)} ${w.editing?`Guardar cambios`:`Confirmar turno`}</button>`}if(t===`ticket`){let t=x.get().turns.find(e=>e.id===n.dataset.id)??r[0];if(!t){n.innerHTML=A(`Tu turno`,`Sin turno`)+`<div class="aempty">${e(`calendar`)}<p>No tienes turnos activos.</p></div>`;return}n.dataset.id=t.id;let a=t.status===`atendido`;n.innerHTML=`
          ${A(a?`Trámite terminado`:`Muestra este código en la entrada`,a?`¡Listo!`:`Tu turno`,`citas`)}
          <article class="ticket">
            <span class="abadge">${a?e(`check`)+` Atendido`:t.ahead===0?e(`bell`)+` Es tu turno`:e(`clock`)+` Confirmado`}</span>
            <div class="ticket__code">${i(t.code)}</div>
            <svg class="ticket__qr" viewBox="0 0 21 21" role="img" aria-label="Código para leer en la entrada">${I(t.code)}</svg>
            <div class="ticket__cut" aria-hidden="true"></div>
            <div style="display:grid;gap:2px"><b>${i(m(t.tramite).n)}</b><span>${i(h(t.sede).n)} · ${o.date(b(t.date))} · ${t.slot}</span></div>
          </article>
          ${a?L(t):`
          <div class="acard live" style="margin-top:14px" aria-live="polite">
            <span class="live__n">${t.ahead}</span>
            <span><b>${t.ahead===0?`Acércate a la ventanilla 4`:t.ahead===1?`persona antes que tú`:`personas antes que tú`}</b><br /><span class="amuted">${t.ahead?`≈ ${M(t)} min de espera`:`Te están esperando`}</span></span>
          </div>
          <div class="asec">
            <button type="button" class="abtn abtn--solid abtn--block" data-act="live" data-id="${t.id}" ${T?`aria-disabled="true"`:``}>${e(`play`)} ${T?`La fila está avanzando…`:`Simular el día de la cita`}</button>
            <button type="button" class="abtn abtn--block" data-act="ics" data-id="${t.id}">${e(`calendar`)} Agregar al calendario</button>
            <button type="button" class="abtn abtn--block" data-act="share" data-id="${t.id}">${e(`next`)} Compartir turno</button>
          </div>`}`}if(t===`citas`){let t=x.get().turns.filter(e=>e.status!==`activo`);n.innerHTML=`
          ${A(`Tus turnos`,`Mis citas`)}
          ${r.length?`<div class="arows">${r.map(e=>`
            <div class="arow" style="flex-wrap:wrap">
              <span class="arow__ico" style="background:var(--a);color:var(--on-a);border-color:var(--a);font-weight:800;font-size:12px;width:auto;padding:0 10px">${i(e.code)}</span>
              <span class="arow__txt"><span class="arow__t">${i(m(e.tramite).n)}</span><span class="arow__d">${o.date(b(e.date))} · ${e.slot} · ${i(h(e.sede).n)}</span></span>
              <span style="display:flex;gap:8px;width:100%;padding-left:54px">
                <button type="button" class="abtn abtn--sm abtn--solid" data-act="open-ticket" data-id="${e.id}">Ver</button>
                <button type="button" class="abtn abtn--sm" data-act="edit" data-id="${e.id}">Cambiar hora</button>
                <button type="button" class="abtn abtn--sm" data-act="cancel" data-id="${e.id}">Cancelar</button>
              </span>
            </div>`).join(``)}</div>`:`
            <div class="aempty">${e(`calendar`)}<p>No tienes turnos activos.</p><button type="button" class="abtn abtn--solid" data-act="tab" data-to="tramites">${e(`plus`)} Sacar turno</button></div>`}
          ${t.length?`<div class="asec"><h3 class="asec__title">Historial</h3><div class="arows">${t.slice(-5).reverse().map(t=>`
            <div class="arow"><span class="arow__ico">${e(t.status===`atendido`?`check`:`close`)}</span><span class="arow__txt"><span class="arow__t">${i(m(t.tramite).n)}</span><span class="arow__d">${t.status===`atendido`?`Atendido`:`Cancelado`} · ${o.date(b(t.date))}</span></span></div>`).join(``)}</div></div>`:``}`}}function P(t){return`<button type="button" class="arow" data-act="pick" data-id="${t.id}"><span class="arow__ico">${e(`doc`)}</span><span class="arow__txt"><span class="arow__t">${i(t.n)}</span><span class="arow__d">${i(t.d)} · ≈ ${t.min} min</span></span><span class="arow__end">${e(`next`)}</span></button>`}function F(){let t=a.querySelector(`[data-tramite-list]`),n=a.querySelector(`[data-search-count]`);if(!t||!n)return;let r=E.trim().toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``),o=u.filter(e=>(e.n+` `+e.d).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).includes(r));t.innerHTML=o.length?o.map(P).join(``):`<div class="aempty">${e(`search`)}<p>No encontramos «${i(E)}».</p><button type="button" class="alink" data-act="clear-search">Ver todos los trámites</button></div>`,n.textContent=o.length===1?`1 trámite`:`${o.length} trámites`}function I(e){let t=g(e),n=``,r=(e,t)=>`<path d="M${e} ${t}h7v7h-7zM${e+1} ${t+1}v5h5v-5zM${e+2} ${t+2}h3v3h-3z" fill="#0b0b0b" fill-rule="evenodd"/>`;for(let e=0;e<21;e++)for(let r=0;r<21;r++)r<8&&e<8||r>12&&e<8||r<8&&e>12||(t=Math.imul(t^r*31+e,2654435761)>>>0,t%100<46&&(n+=`M${r} ${e}h1v1h-1z`));return r(0,0)+r(14,0)+r(0,14)+`<path d="${n}" fill="#0b0b0b"/>`}function L(t){return`<div class="acard" style="margin-top:14px;display:grid;gap:12px;text-align:center">
        <b>¿Cómo te fue?</b>
        <div class="stars" role="radiogroup" aria-label="Califica la atención">${[1,2,3,4,5].map(n=>`<button type="button" class="star" role="radio" aria-checked="${(t.rating??0)>=n}" aria-label="${n} de 5" data-act="rate" data-id="${t.id}" data-n="${n}">${e(`star`)}</button>`).join(``)}</div>
        <p class="amuted">${t.rating?`¡Gracias! Tu opinión llega directo a la sede.`:`Tu calificación ayuda a mejorar la sede.`}</p>
        <button type="button" class="abtn abtn--solid abtn--block" data-act="tab" data-to="inicio">Volver al inicio</button>
      </div>`}function R(e){w={tramite:e,checks:[],sede:``,date:``,slot:``,remind:!0,near:!0},k(`req`)}function z(e){if(T)return;T=window.setInterval(()=>{let n=x.get().turns.find(t=>t.id===e);if(!n||n.status!==`activo`)return t();O(t=>{let n=t.turns.find(t=>t.id===e);n.ahead=Math.max(0,n.ahead-1)});let r=n.ahead-1;r===3&&n.near&&(l(a,`Faltan 3 turnos. Ve acercándote a la Sede.`),c(30)),r===0&&(l(a,`${n.code}: es tu turno. Ventanilla 4.`),c(60)),r<0&&(O(t=>{t.turns.find(t=>t.id===e).status=`atendido`}),l(a,`Trámite terminado. ¡Gracias por venir!`),t()),C===`ticket`&&N(`ticket`)},s()?2600:1600),N(`ticket`);function t(){clearInterval(T),T=0,C===`ticket`&&N(`ticket`)}}function B(e){let[t,n]=e.slot.split(`:`).map(Number),r=b(e.date);r.setHours(t,n,0,0);let i=new Date(r.getTime()+m(e.tramite).min*6e4),o=e=>`${e.getFullYear()}${String(e.getMonth()+1).padStart(2,`0`)}${String(e.getDate()).padStart(2,`0`)}T${String(e.getHours()).padStart(2,`0`)}${String(e.getMinutes()).padStart(2,`0`)}00`,s=m(e.tramite).req.filter(e=>e.must).map(e=>e.t).join(`, `),c=[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//186//Fila//ES`,`BEGIN:VEVENT`,`UID:${e.id}@fila.186`,`DTSTAMP:${o(new Date)}`,`DTSTART:${o(r)}`,`DTEND:${o(i)}`,`SUMMARY:Turno ${e.code} · ${m(e.tramite).n}`,`LOCATION:${h(e.sede).n}\\, ${h(e.sede).a.replace(/,/g,`\\,`)}`,`DESCRIPTION:Lleva: ${s.replace(/,/g,`\\,`)}`];e.remind&&c.push(`BEGIN:VALARM`,`TRIGGER:-P1D`,`ACTION:DISPLAY`,`DESCRIPTION:Mañana tienes tu turno`,`END:VALARM`),c.push(`END:VEVENT`,`END:VCALENDAR`);let u=document.createElement(`a`);u.href=URL.createObjectURL(new Blob([c.join(`\r
`)],{type:`text/calendar`})),u.download=`turno-${e.code}.ics`,u.click(),setTimeout(()=>URL.revokeObjectURL(u.href),2e3),l(a,`Listo: ábrelo para guardarlo en tu calendario.`)}function V(e,t){let n=e.closest(`[role="radiogroup"]`);if(!n)return;let r=Array.from(n.querySelectorAll(`[role="radio"]:not([aria-disabled="true"])`)),i=r[(r.indexOf(e)+t+r.length)%r.length];i?.click(),requestAnimationFrame(()=>a.querySelector(`[data-act="${i.dataset.act}"][data-id="${i.dataset.id}"]`)?.focus())}let H=async e=>{let r=e.target.closest(`[data-tab]`);if(r){k(r.dataset.tab);return}let i=e.target.closest(`[data-act]`);if(!i)return;let s=i.dataset.act,u=i.dataset.id;if((s===`tab`||s===`back`)&&k(i.dataset.to),s===`pick`&&R(u),s===`clear-search`&&(E=``,N(`tramites`),a.querySelector(`[data-search]`)?.focus()),s===`req-next`&&w){if(m(w.tramite).req.filter(e=>e.must&&!w.checks.includes(e.t)).length){w.showErr=!0,N(`req`);let e=a.querySelector(`[data-req-err] .err`);e?.focus({preventScroll:!0}),e?.scrollIntoView({block:`nearest`});return}w.showErr=!1,k(`cita`)}if(s===`req-anyway`&&w&&(w.showErr=!1,k(`cita`)),w&&(s===`sede`||s===`day`||s===`slot`)){if(i.getAttribute(`aria-disabled`)===`true`){l(a,`Esa hora ya no tiene cupo. Prueba otra o cambia de sede.`);return}s===`sede`&&(w.sede=u,w.slot&&_(w.date,u,w.slot)&&(w.slot=``)),s===`day`&&(w.date=u,w.slot&&w.sede&&_(u,w.sede,w.slot)&&(w.slot=``)),s===`slot`&&(w.slot=u),w.showErr=!1;let e=S(`cita`).scrollTop;N(`cita`),S(`cita`).scrollTop=e,a.querySelector(`[data-act="${s}"][data-id="${u}"]`)?.focus({preventScroll:!0})}if(s===`cita-next`&&w){if(!w.sede||!w.slot){w.showErr=!0,N(`cita`);let e=a.querySelector(`[data-cita-err]`);e?.focus({preventScroll:!0}),e?.scrollIntoView({block:`nearest`});return}k(`confirmar`)}if(s===`confirm`&&w){let e=w,t=m(e.tramite).req.filter(t=>t.must&&!e.checks.includes(t.t)).map(e=>e.t),n=e.editing;O(r=>{if(n){let t=r.turns.find(e=>e.id===n);Object.assign(t,{sede:e.sede,date:e.date,slot:e.slot,remind:e.remind,near:e.near,ahead:6+g(e.slot)%6})}else r.seq+=1,n=`t${Date.now()}`,r.turns.push({id:n,code:`${`ABCD`[r.seq%4]}-${r.seq}`,tramite:e.tramite,sede:e.sede,date:e.date,slot:e.slot,status:`activo`,ahead:6+g(e.slot)%6,remind:e.remind,near:e.near,missing:t})}),l(a,e.editing?`Cambiamos tu hora. Te enviamos el nuevo turno.`:`Turno confirmado. Te avisaremos antes de la cita.`),c(20),w=null,S(`ticket`).dataset.id=n,k(`ticket`)}if(s===`open-ticket`&&(S(`ticket`).dataset.id=u,k(`ticket`)),s===`live`&&i.getAttribute(`aria-disabled`)!==`true`&&z(u),s===`ics`){let e=x.get().turns.find(e=>e.id===u);e&&B(e)}if(s===`share`){let e=x.get().turns.find(e=>e.id===u);if(!e)return;let t=`Mi turno ${e.code}: ${m(e.tramite).n}, ${h(e.sede).n}, ${o.date(b(e.date))} a las ${e.slot}.`;try{navigator.share?await navigator.share({title:`Turno Fila`,text:t}):(await navigator.clipboard.writeText(t),l(a,`Copiamos los datos del turno.`))}catch{}}if(s===`edit`){let e=x.get().turns.find(e=>e.id===u);w={tramite:e.tramite,checks:m(e.tramite).req.map(e=>e.t).filter(t=>!e.missing.includes(t)),sede:e.sede,date:e.date,slot:e.slot,remind:e.remind,near:e.near,editing:e.id},k(`cita`)}if(s===`cancel`){let e=x.get().turns.find(e=>e.id===u),r=a.querySelector(`[data-sheet="cancel"]`);if(r.querySelector(`[data-cancel-detail]`).textContent=`${e.code} · ${m(e.tramite).n}, ${o.date(b(e.date))} a las ${e.slot}.`,await t(r)!==`si`)return;O(e=>{e.turns.find(e=>e.id===u).status=`cancelado`}),N(`citas`),n(S(`citas`)),l(a,`Turno ${e.code} cancelado.`,{label:`Deshacer`,run:()=>{O(e=>{e.turns.find(e=>e.id===u).status=`activo`}),N(C)}})}s===`rate`&&(O(e=>{e.turns.find(e=>e.id===u).rating=Number(i.dataset.n)}),N(`ticket`),a.querySelector(`[data-act="rate"][data-n="${i.dataset.n}"]`)?.focus())},U=e=>{let t=e.target.closest(`[role="radio"]`);t&&((e.key===`ArrowRight`||e.key===`ArrowDown`)&&(e.preventDefault(),V(t,1)),(e.key===`ArrowLeft`||e.key===`ArrowUp`)&&(e.preventDefault(),V(t,-1)))},W=e=>{let t=e.target;t.matches(`[data-search]`)&&(E=t.value,F())},G=e=>{let t=e.target;t.dataset.check&&w&&(w.checks=t.checked?[...w.checks,t.dataset.check]:w.checks.filter(e=>e!==t.dataset.check),w.showErr&&(m(w.tramite).req.filter(e=>e.must&&!w.checks.includes(e.t)).length||(w.showErr=!1,a.querySelector(`[data-req-err]`).innerHTML=``))),t.dataset.opt&&w&&(w[t.dataset.opt]=t.checked)},K=()=>{clearInterval(T),T=0,x.reset(),w=null,E=``,k(`inicio`),l(a,`Demo reiniciada.`)},q=document.querySelector(`[data-app-reset]`);return a.addEventListener(`click`,H),a.addEventListener(`keydown`,U),a.addEventListener(`input`,W),a.addEventListener(`change`,G),q?.addEventListener(`click`,K),a.querySelectorAll(`dialog`).forEach(e=>e.addEventListener(`click`,t=>t.target===e&&e.close(``))),k(`inicio`,!1),()=>{clearInterval(T),a.removeEventListener(`click`,H),a.removeEventListener(`keydown`,U),a.removeEventListener(`input`,W),a.removeEventListener(`change`,G),q?.removeEventListener(`click`,K)}});