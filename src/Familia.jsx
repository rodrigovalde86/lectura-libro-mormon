import React, { useState } from 'react';
import { supabase } from './supabase';
import {
  Users, UserPlus, Copy, Pencil, Trash2, KeyRound, BookOpen, CheckCircle2, Circle, Heart, Bell
} from 'lucide-react';

export const MENSAJES_ANIMO = {
  animo: { icono: '💪', texto: '¡Ánimo, sigue leyendo!' },
  recordatorio: { icono: '📖', texto: 'Hoy te toca tu lectura. ¡No te la pierdas!' },
  celebracion: { icono: '🎉', texto: '¡Felicidades por tu lectura!' },
  gracias: { icono: '🙏', texto: '¡Gracias por tu ejemplo!' }
};

const PARENTESCOS = ['Esposo/a', 'Hijo/a', 'Padre/Madre', 'Abuelo/a', 'Hermano/a', 'Amigo/a'];

const inputCls =
  'w-full bg-[#0c1626] border border-slate-600 focus:border-[#C9A808] rounded-xl px-4 py-2.5 text-sm text-white outline-none';
const labelCls = 'block text-xs font-semibold text-[#C9A808] uppercase tracking-wider mb-1';

// ============================================================================
// PRIMERA VEZ: crear la familia o unirse con un código
// ============================================================================
export function Onboarding({ nombreSugerido, onListo, onSalir }) {
  const [modo, setModo] = useState('crear');
  const [miNombre, setMiNombre] = useState(nombreSugerido || '');
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const crear = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const { error: err } = await supabase.rpc('crear_familia', {
      p_nombre: nombreFamilia.trim() || miNombre.trim(),
      p_mi_nombre: miNombre.trim()
    });
    setCargando(false);
    if (err) return setError(err.message);
    onListo();
  };

  const unirse = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    const { error: err } = await supabase.rpc('vincular_cuenta', { p_codigo: codigo });
    setCargando(false);
    if (err) return setError(err.message);
    onListo();
  };

  return (
    <div className="min-h-screen bg-[#0c1626] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#14233C] border-2 border-[#C9A808] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#0c1626] border-2 border-[#C9A808] flex items-center justify-center">
            <Users className="w-7 h-7 text-[#C9A808]" />
          </div>
          <h1 className="text-2xl font-serif font-bold">Tu familia de lectura</h1>
          <p className="text-sm text-slate-300 mt-1">
            Cada persona tiene su propio avance. Quien crea la familia puede agregar a sus hijos.
          </p>
        </div>

        <div className="grid grid-cols-2 bg-[#0c1626] p-1 rounded-xl border border-[#C9A808]/30">
          {[['crear', 'Empezar'], ['unirse', 'Tengo un código']].map(([id, texto]) => (
            <button
              key={id}
              type="button"
              onClick={() => { setModo(id); setError(''); }}
              className={`py-2 text-sm font-semibold rounded-lg transition ${
                modo === id ? 'bg-[#C9A808] text-[#14233C]' : 'text-slate-300 hover:text-white'
              }`}
            >
              {texto}
            </button>
          ))}
        </div>

        {modo === 'crear' ? (
          <form onSubmit={crear} className="space-y-4">
            <div>
              <label className={labelCls}>Tu nombre</label>
              <input className={inputCls} value={miNombre} onChange={(e) => setMiNombre(e.target.value)} maxLength={40} />
            </div>
            <div>
              <label className={labelCls}>Nombre de la familia (opcional)</label>
              <input
                className={inputCls}
                placeholder="Nombre o Familia"
                value={nombreFamilia}
                onChange={(e) => setNombreFamilia(e.target.value)}
                maxLength={60}
              />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-950/50 border border-red-500/40 rounded-lg p-2.5">{error}</p>}
            <button
              type="submit"
              disabled={cargando || !miNombre.trim()}
              className="w-full bg-[#C9A808] hover:bg-[#b59607] disabled:opacity-50 text-[#14233C] font-bold py-3 rounded-xl"
            >
              {cargando ? 'Creando...' : 'Empezar a leer'}
            </button>
            <p className="text-xs text-slate-400">
              Si lees solo/a, no necesitas nada más. Después puedes agregar a tus hijos desde la pestaña Familia.
            </p>
          </form>
        ) : (
          <form onSubmit={unirse} className="space-y-4">
            <p className="text-sm text-slate-300">
              Si alguien de tu familia ya creó el grupo, pídele el código de tu perfil e ingrésalo aquí.
            </p>
            <div>
              <label className={labelCls}>Código</label>
              <input
                className={`${inputCls} tracking-[0.3em] uppercase text-center text-lg`}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={8}
                placeholder="XXXXXXXX"
              />
            </div>
            {error && <p className="text-xs text-red-400 bg-red-950/50 border border-red-500/40 rounded-lg p-2.5">{error}</p>}
            <button
              type="submit"
              disabled={cargando || codigo.trim().length < 6}
              className="w-full bg-[#C9A808] hover:bg-[#b59607] disabled:opacity-50 text-[#14233C] font-bold py-3 rounded-xl"
            >
              {cargando ? 'Uniendo...' : 'Unirme a mi familia'}
            </button>
          </form>
        )}

        <button onClick={onSalir} className="w-full text-xs text-slate-400 hover:text-[#C9A808]">
          Salir
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PESTAÑA FAMILIA
// ============================================================================
export function FamiliaVista({ familia, perfilActivo, setPerfilActivo, diaHoy, animos, recargar, irAHoy }) {
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', parentesco: '', admin: false });
  const [editando, setEditando] = useState(null);
  const [animando, setAnimando] = useState(null);
  const [codigos, setCodigos] = useState({});
  const [ocupado, setOcupado] = useState(false);

  const miembros = familia.miembros;
  const soyAdmin = familia.soy_admin;
  const activo = miembros.find((m) => m.id === perfilActivo) || miembros[0];

  const ejecutar = async (fn, mensajeOk) => {
    setError('');
    setAviso('');
    setOcupado(true);
    const { data, error: err } = await fn();
    setOcupado(false);
    if (err) {
      setError(err.message);
      return { ok: false };
    }
    if (mensajeOk) setAviso(mensajeOk);
    await recargar();
    return { ok: true, data };
  };

  const agregar = async (e) => {
    e.preventDefault();
    const r = await ejecutar(
      () => supabase.rpc('agregar_miembro', {
        p_nombre: nuevo.nombre,
        p_parentesco: nuevo.parentesco,
        p_es_admin: nuevo.admin
      }),
      `${nuevo.nombre.trim()} se agregó a la familia.`
    );
    if (r.ok) {
      setNuevo({ nombre: '', parentesco: '', admin: false });
      setAgregando(false);
    }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const r = await ejecutar(
      () => supabase.rpc('editar_miembro', {
        p_id: editando.id,
        p_nombre: editando.nombre,
        p_parentesco: editando.parentesco
      }),
      'Cambios guardados.'
    );
    if (r.ok) setEditando(null);
  };

  const eliminar = async (m) => {
    if (!window.confirm(`¿Quitar a ${m.nombre} de la familia? Se borra también su avance de lectura.`)) return;
    await ejecutar(() => supabase.rpc('eliminar_miembro', { p_id: m.id }), `${m.nombre} fue quitado de la familia.`);
  };

  const generarCodigo = async (m) => {
    const r = await ejecutar(() => supabase.rpc('generar_codigo_vinculo', { p_id: m.id }));
    if (r.ok) setCodigos((c) => ({ ...c, [m.id]: r.data }));
  };

  const copiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      setAviso('Copiado.');
    } catch (e) {
      window.prompt('Copia este texto:', texto);
    }
  };

  const enviarAnimo = async (m, tipo) => {
    const r = await ejecutar(
      () => supabase.rpc('enviar_animo', { p_de: activo.id, p_a: m.id, p_tipo: tipo }),
      `Mensaje enviado a ${m.nombre}.`
    );
    if (r.ok) setAnimando(null);
  };

  const yaEnvie = (m) => (animos.enviados_hoy || []).some((x) => x.de === activo.id && x.a === m.id);

  const marcarLeidos = async () => {
    const paraIds = [...new Set(animos.recibidos.filter((a) => !a.leido).map((a) => a.para_id))];
    setOcupado(true);
    for (const id of paraIds) {
      await supabase.rpc('marcar_animos_leidos', { p_miembro: id });
    }
    setOcupado(false);
    await recargar();
  };

  const sinLeer = (animos.recibidos || []).filter((a) => !a.leido).length;

  return (
    <div className="space-y-5">
      <div className="bg-[#14233C] border border-[#C9A808]/60 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[#C9A808] text-xs font-bold uppercase tracking-widest mb-1">
          <Users className="w-4 h-4" /> Familia
        </div>
        <h2 className="text-2xl font-serif font-bold text-white">{familia.familia.nombre}</h2>
        <p className="text-xs text-slate-300 mt-1">
          Aquí ves el avance de tu familia y puedes animarlos.
          {soyAdmin && ' Como administrador/a, también puedes marcar las lecturas de tus hijos.'}
        </p>
      </div>

      {error && <p className="text-sm text-red-300 bg-red-950/50 border border-red-500/40 rounded-xl p-3">{error}</p>}
      {aviso && <p className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3">{aviso}</p>}

      {animos.recibidos && animos.recibidos.length > 0 && (
        <div className="bg-[#14233C] border border-[#C9A808]/40 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#C9A808] text-xs font-bold uppercase tracking-widest">
              <Bell className="w-4 h-4" /> Mensajes {sinLeer > 0 && <span className="bg-[#C9A808] text-[#14233C] rounded-full px-2 py-0.5">{sinLeer} nuevos</span>}
            </div>
            {sinLeer > 0 && (
              <button onClick={marcarLeidos} disabled={ocupado} className="text-xs text-slate-300 hover:text-[#C9A808] underline underline-offset-2">
                Marcar como leídos
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {animos.recibidos.slice(0, 8).map((a) => {
              const msg = MENSAJES_ANIMO[a.tipo] || MENSAJES_ANIMO.animo;
              return (
                <li key={a.id} className={`text-sm rounded-xl px-3 py-2 border ${a.leido ? 'border-slate-700 text-slate-300' : 'border-[#C9A808]/60 text-white bg-[#0c1626]'}`}>
                  <span className="mr-1">{msg.icono}</span>
                  <strong className="text-[#C9A808]">{a.de_nombre}</strong>
                  {a.para_id !== activo.id && <span className="text-slate-400"> a {a.para_nombre}</span>}: {msg.texto}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {miembros.map((m) => {
          const pct = Math.round((m.dias_completados.length / 365) * 100);
          const leyoHoy = m.dias_completados.includes(diaHoy);
          const esActivo = m.id === activo.id;
          const esYo = m.id === familia.yo;
          const codigo = codigos[m.id] || m.codigo_vinculo;

          return (
            <div key={m.id} className={`bg-[#14233C] border rounded-2xl p-4 sm:p-5 space-y-3 ${esActivo ? 'border-[#C9A808]' : 'border-slate-700'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#0c1626] border border-[#C9A808]/60 flex items-center justify-center text-[#C9A808] font-bold">
                    {m.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {m.nombre}{esYo && <span className="text-xs text-[#C9A808]"> (tú)</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {[m.parentesco, m.es_admin ? 'Administrador/a' : null].filter(Boolean).join(' • ') || (m.tiene_cuenta ? 'Con cuenta propia' : 'Perfil de la familia')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 shrink-0 ${leyoHoy ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {leyoHoy ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  {leyoHoy ? 'Leyó hoy' : 'Hoy no'}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{m.dias_completados.length} de 365 días</span>
                  <span className="text-[#C9A808] font-semibold">{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#0c1626] rounded-full overflow-hidden border border-slate-700">
                  <div className="h-full bg-gradient-to-r from-[#C9A808] to-amber-300" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {m.puedo_actuar && !esActivo && (
                  <button
                    onClick={() => { setPerfilActivo(m.id); irAHoy(); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#14233C] bg-[#C9A808] hover:bg-[#b59607] px-3 py-2 rounded-xl"
                  >
                    <BookOpen className="w-4 h-4" /> Leer como {m.nombre}
                  </button>
                )}
                {m.id !== activo.id && (
                  <button
                    onClick={() => setAnimando(animando === m.id ? null : m.id)}
                    disabled={yaEnvie(m)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#C9A808] bg-[#0c1626] border border-[#C9A808]/60 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-xl"
                  >
                    <Heart className="w-4 h-4" /> {yaEnvie(m) ? 'Ya le escribiste hoy' : 'Animar'}
                  </button>
                )}
                {m.puedo_actuar && (
                  <button
                    onClick={() => setEditando({ id: m.id, nombre: m.nombre, parentesco: m.parentesco || '' })}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#C9A808] bg-[#0c1626] border border-slate-700 px-3 py-2 rounded-xl"
                  >
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                )}
                {soyAdmin && !esYo && (
                  <button
                    onClick={() => eliminar(m)}
                    className="flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 bg-[#0c1626] border border-slate-700 px-3 py-2 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" /> Quitar
                  </button>
                )}
              </div>

              {animando === m.id && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(MENSAJES_ANIMO).map(([tipo, msg]) => (
                    <button
                      key={tipo}
                      onClick={() => enviarAnimo(m, tipo)}
                      disabled={ocupado}
                      className="text-left text-sm bg-[#0c1626] hover:border-[#C9A808] border border-slate-700 rounded-xl px-3 py-2"
                    >
                      <span className="mr-1">{msg.icono}</span>{msg.texto}
                    </button>
                  ))}
                  <p className="sm:col-span-2 text-[11px] text-slate-400">
                    Se envía como {activo.nombre}. Puedes enviar un mensaje por persona al día.
                  </p>
                </div>
              )}

              {editando?.id === m.id && (
                <form onSubmit={guardarEdicion} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#0c1626] rounded-xl p-3">
                  <input className={inputCls} value={editando.nombre} maxLength={40}
                    onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} placeholder="Nombre" />
                  <input className={inputCls} value={editando.parentesco} maxLength={30} list="parentescos"
                    onChange={(e) => setEditando({ ...editando, parentesco: e.target.value })} placeholder="Parentesco (opcional)" />
                  <div className="sm:col-span-2 flex gap-2">
                    <button type="submit" disabled={ocupado || !editando.nombre.trim()} className="text-xs font-bold bg-[#C9A808] text-[#14233C] px-4 py-2 rounded-xl disabled:opacity-50">Guardar</button>
                    <button type="button" onClick={() => setEditando(null)} className="text-xs text-slate-300 px-3 py-2">Cancelar</button>
                  </div>
                </form>
              )}

              {soyAdmin && !m.tiene_cuenta && (
                <div className="text-xs text-slate-300 border-t border-slate-700 pt-3 space-y-2">
                  {codigo ? (
                    <div className="space-y-1">
                      <p>
                        Para que {m.nombre} entre con su propia cuenta (por ejemplo un joven o tu cónyuge): que abra la app,
                        inicie sesión, elija <strong>«Tengo un código»</strong> e ingrese:
                      </p>
                      <button onClick={() => copiar(codigo)} className="inline-flex items-center gap-2 text-lg tracking-[0.3em] font-bold text-[#C9A808] bg-[#0c1626] border border-[#C9A808]/60 rounded-xl px-4 py-1.5">
                        {codigo} <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => generarCodigo(m)} disabled={ocupado} className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#C9A808] underline underline-offset-2">
                      <KeyRound className="w-4 h-4" /> Dar acceso con su propia cuenta
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <datalist id="parentescos">
        {PARENTESCOS.map((p) => <option key={p} value={p} />)}
      </datalist>

      {soyAdmin && (
        <div className="bg-[#14233C] border border-[#C9A808]/40 rounded-3xl p-5 sm:p-6">
          {!agregando ? (
            <button
              onClick={() => setAgregando(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A808] hover:bg-[#b59607] text-[#14233C] font-bold py-3 rounded-xl"
            >
              <UserPlus className="w-5 h-5" /> Agregar a mi familia
            </button>
          ) : (
            <form onSubmit={agregar} className="space-y-3">
              <h3 className="font-serif font-bold text-white">Agregar una persona</h3>
              <p className="text-xs text-slate-300">
                Para hijos pequeños basta con el nombre: tú marcas sus lecturas desde tu cuenta.
              </p>
              <div>
                <label className={labelCls}>Nombre</label>
                <input className={inputCls} value={nuevo.nombre} maxLength={40}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} autoFocus />
              </div>
              <div>
                <label className={labelCls}>Parentesco (opcional)</label>
                <input className={inputCls} value={nuevo.parentesco} maxLength={30} list="parentescos"
                  onChange={(e) => setNuevo({ ...nuevo, parentesco: e.target.value })} placeholder="Hijo/a, esposo/a..." />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input type="checkbox" checked={nuevo.admin} onChange={(e) => setNuevo({ ...nuevo, admin: e.target.checked })} />
                Puede administrar la familia (adulto)
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={ocupado || !nuevo.nombre.trim()} className="font-bold bg-[#C9A808] text-[#14233C] px-5 py-2.5 rounded-xl disabled:opacity-50">
                  Agregar
                </button>
                <button type="button" onClick={() => setAgregando(false)} className="text-sm text-slate-300 px-3">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
