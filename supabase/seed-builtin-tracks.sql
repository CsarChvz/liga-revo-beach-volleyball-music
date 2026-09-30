-- ============================================================
-- INSERT de todas las canciones existentes en public/audio/
-- como tracks "built-in" (is_built_in = true).
--
-- NOTA: Los storage_path usan nombres sanitizados (sin tildes)
-- igual que como los sube el script upload-audio.mjs.
--
-- Cómo usar:
--   1. Sube primero los archivos con: npm run upload-audio
--   2. Abre Supabase → SQL Editor → New query → pega y corre.
-- ============================================================

INSERT INTO tracks
  (id, title, category, source_type, storage_path, duration, is_built_in, playlist_order)
VALUES

-- ----------------------------------------------------------------
-- presentation  (180s)
-- ----------------------------------------------------------------
  ('builtin-presentation-capaz-merengueton',           'Capaz (Merengueton)',                                 'presentation', 'local', 'presentation/capaz (merengueton).mp3',                                                   180, true,  1),
  ('builtin-presentation-con-la-misma-piedra',         'Con La Misma Piedra',                                 'presentation', 'local', 'presentation/Con la Misma Piedra.mp3',                                                   180, true,  2),
  ('builtin-presentation-dance-monkey',                'Dance Monkey',                                        'presentation', 'local', 'presentation/Dance Monkey.mp3',                                                          180, true,  3),
  ('builtin-presentation-danza-kuduro',                'Danza Kuduro',                                        'presentation', 'local', 'presentation/Danza Kuduro.mp3',                                                          180, true,  4),
  ('builtin-presentation-dembow',                      'Dembow',                                              'presentation', 'local', 'presentation/Dembow.mp3',                                                                180, true,  5),
  ('builtin-presentation-el-sinaloense',               'El Sinaloense',                                       'presentation', 'local', 'presentation/El Sinaloense.mp3',                                                         180, true,  6),
  ('builtin-presentation-el-tiburon',                  'El Tiburon',                                          'presentation', 'local', 'presentation/El Tiburon.mp3',                                                            180, true,  7),
  ('builtin-presentation-ella-me-levanto',             'Ella Me Levanto',                                     'presentation', 'local', 'presentation/Ella Me Levanto.mp3',                                                       180, true,  8),
  ('builtin-presentation-en-barranquilla-me-quedo',    'En Barranquilla Me Quedo',                            'presentation', 'local', 'presentation/En Barranquilla Me Quedo.mp3',                                              180, true,  9),
  ('builtin-presentation-eoo',                         'EoO',                                                 'presentation', 'local', 'presentation/EoO.mp3',                                                                   180, true, 10),
  ('builtin-presentation-eye-of-the-tiger',            'Eye Of The Tiger',                                    'presentation', 'local', 'presentation/Eye of the Tiger.mp3',                                                      180, true, 11),
  ('builtin-presentation-freaks-radio-edit',           'Freaks (Radio Edit)',                                 'presentation', 'local', 'presentation/Freaks - Radio Edit.mp3',                                                   180, true, 12),
  ('builtin-presentation-gloria',                      'Gloria',                                              'presentation', 'local', 'presentation/Gloria.mp3',                                                                180, true, 13),
  ('builtin-presentation-i-was-made-for-lovin-you',    'I Was Made For Lovin You',                            'presentation', 'local', 'presentation/I Was Made For Lovin You.mp3',                                              180, true, 14),
  ('builtin-presentation-ingles-en-miami',             'Inglés En Miami',                                     'presentation', 'local', 'presentation/Ingles En Miami.mp3',                                                       180, true, 15),
  ('builtin-presentation-la-verdolaga',                'La Verdolaga',                                        'presentation', 'local', 'presentation/La Verdolaga.mp3',                                                          180, true, 16),
  ('builtin-presentation-la-vida-es-un-carnaval',      'La Vida Es Un Carnaval',                              'presentation', 'local', 'presentation/La Vida Es Un Carnaval.mp3',                                                180, true, 17),
  ('builtin-presentation-me-rehuso',                   'Me Rehúso',                                           'presentation', 'local', 'presentation/Me Rehuso.mp3',                                                             180, true, 18),
  ('builtin-presentation-morenita',                    'Morenita',                                            'presentation', 'local', 'presentation/Morenita.mp3',                                                              180, true, 19),
  ('builtin-presentation-pelotero-a-la-bola',          'Pelotero A La Bola',                                  'presentation', 'local', 'presentation/Pelotero A La Bola.mp3',                                                    180, true, 20),
  ('builtin-presentation-procura',                     'Procura',                                             'presentation', 'local', 'presentation/Procura.mp3',                                                               180, true, 21),
  ('builtin-presentation-pintame',                     'Píntame',                                             'presentation', 'local', 'presentation/Pintame.mp3',                                                               180, true, 22),
  ('builtin-presentation-rasputin',                    'Rasputin',                                            'presentation', 'local', 'presentation/Rasputin.mp3',                                                              180, true, 23),
  ('builtin-presentation-rebelion',                    'Rebelión',                                            'presentation', 'local', 'presentation/Rebelion.mp3',                                                              180, true, 24),
  ('builtin-presentation-roses-imanbek-remix',         'Roses (Imanbek Remix)',                               'presentation', 'local', 'presentation/Roses - Imanbek Remix.mp3',                                                 180, true, 25),
  ('builtin-presentation-spanish-girl',                'Spanish Girl',                                        'presentation', 'local', 'presentation/Spanish Girl.mp3',                                                          180, true, 26),
  ('builtin-presentation-stayin-alive',                'Stayin Alive (Saturday Night Fever)',                 'presentation', 'local', 'presentation/Stayin Alive - From Saturday Night Fever Soundtrack.mp3',                   180, true, 27),
  ('builtin-presentation-sufriendo',                   'Sufriendo',                                           'presentation', 'local', 'presentation/Sufriendo.mp3',                                                             180, true, 28),
  ('builtin-presentation-sway',                        'Sway',                                                'presentation', 'local', 'presentation/Sway.mp3',                                                                  180, true, 29),
  ('builtin-presentation-sweet-memories',              'Sweet Memories',                                      'presentation', 'local', 'presentation/Sweet Memories.mp3',                                                        180, true, 30),
  ('builtin-presentation-talento-de-television',       'Talento De Televisión',                               'presentation', 'local', 'presentation/Talento De Television.mp3',                                                 180, true, 31),
  ('builtin-presentation-te-la-tiro-pa-que-bailes',    'Te La Tiro Pa Que Bailes',                            'presentation', 'local', 'presentation/Te la Tiro Pa Que Bailes.mp3',                                              180, true, 32),
  ('builtin-presentation-todo-de-ti',                  'Todo De Ti',                                          'presentation', 'local', 'presentation/Todo De Ti.mp3',                                                            180, true, 33),
  ('builtin-presentation-tu-sonrisa',                  'Tu Sonrisa',                                          'presentation', 'local', 'presentation/Tu Sonrisa.mp3',                                                            180, true, 34),
  ('builtin-presentation-tusa',                        'Tusa',                                                'presentation', 'local', 'presentation/Tusa.mp3',                                                                  180, true, 35),
  ('builtin-presentation-tu-con-el',                   'Tú Con Él',                                           'presentation', 'local', 'presentation/Tu Con El.mp3',                                                             180, true, 36),
  ('builtin-presentation-tu-me-vuelves-loco',          'Tú Me Vuelves Loco',                                  'presentation', 'local', 'presentation/Tu Me Vuelves Loco.mp3',                                                    180, true, 37),
  ('builtin-presentation-wake-me-up',                  'Wake Me Up',                                          'presentation', 'local', 'presentation/Wake Me Up.mp3',                                                            180, true, 38),
  ('builtin-presentation-we-are-the-champions',        'We Are The Champions',                                'presentation', 'local', 'presentation/We Are the Champions.mp3',                                                  180, true, 39),
  ('builtin-presentation-weltita',                     'WELTiTA',                                             'presentation', 'local', 'presentation/WELTiTA.mp3',                                                               180, true, 40),
  ('builtin-presentation-without-me',                  'Without Me',                                          'presentation', 'local', 'presentation/Without Me.mp3',                                                            180, true, 41),

-- ----------------------------------------------------------------
-- point_intros  (12s)
-- ----------------------------------------------------------------
  ('builtin-point_intros-atrevete-te-te',              'Atrévete-Te-Te',                                      'point_intros', 'local', 'point_intros/Atrevete-Te-Te.mp3',                                                         12, true,  1),
  ('builtin-point_intros-baila-esta-cumbia',           'Baila Esta Cumbia',                                   'point_intros', 'local', 'point_intros/Baila Esta Cumbia.mp3',                                                      12, true,  2),
  ('builtin-point_intros-beso-al-aire',                'Beso Al Aire',                                        'point_intros', 'local', 'point_intros/Beso Al Aire.mp3',                                                           12, true,  3),
  ('builtin-point_intros-camaron-pelao',               'Camaron Pelao',                                       'point_intros', 'local', 'point_intros/Camaron Pelao.mp3',                                                          12, true,  4),
  ('builtin-point_intros-culo-remix',                  'Culo Remix',                                          'point_intros', 'local', 'point_intros/Culo Remix.mp3',                                                             12, true,  5),
  ('builtin-point_intros-el-baile-del-perrito',        'El Baile Del Perrito',                                'point_intros', 'local', 'point_intros/El Baile del Perrito.mp3',                                                   12, true,  6),
  ('builtin-point_intros-el-baile-del-sapito',         'El Baile Del Sapito',                                 'point_intros', 'local', 'point_intros/El Baile del Sapito.mp3',                                                    12, true,  7),
  ('builtin-point_intros-el-bombon-asesino',           'El Bombón Asesino',                                   'point_intros', 'local', 'point_intros/El Bombon Asesino.mp3',                                                      12, true,  8),
  ('builtin-point_intros-el-botecito',                 'El Botecito',                                         'point_intros', 'local', 'point_intros/El Botecito.mp3',                                                            12, true,  9),
  ('builtin-point_intros-el-coco-no',                  'El Coco No',                                          'point_intros', 'local', 'point_intros/El Coco No.mp3',                                                             12, true, 10),
  ('builtin-point_intros-el-sonidito',                 'El Sonidito',                                         'point_intros', 'local', 'point_intros/El Sonidito.mp3',                                                            12, true, 11),
  ('builtin-point_intros-el-taxi',                     'El Taxi',                                             'point_intros', 'local', 'point_intros/El Taxi.mp3',                                                                12, true, 12),
  ('builtin-point_intros-feliz-feliz',                 'Feliz, Feliz',                                        'point_intros', 'local', 'point_intros/Feliz, Feliz.mp3',                                                           12, true, 13),
  ('builtin-point_intros-jailhouse-rock',              'Jailhouse Rock',                                      'point_intros', 'local', 'point_intros/Jailhouse Rock.mp3',                                                         12, true, 14),
  ('builtin-point_intros-johnny-b-goode',              'Johnny B. Goode',                                     'point_intros', 'local', 'point_intros/Johnny B. Goode.mp3',                                                        12, true, 15),
  ('builtin-point_intros-juana-la-cubana',             'Juana La Cubana',                                     'point_intros', 'local', 'point_intros/Juana La Cubana.mp3',                                                        12, true, 16),
  ('builtin-point_intros-la-bomba',                    'La Bomba',                                            'point_intros', 'local', 'point_intros/La Bomba.mp3',                                                               12, true, 17),
  ('builtin-point_intros-la-chica-sexy',               'La Chica Sexy',                                       'point_intros', 'local', 'point_intros/La Chica Sexy.mp3',                                                          12, true, 18),
  ('builtin-point_intros-la-chona',                    'La Chona',                                            'point_intros', 'local', 'point_intros/La Chona.mp3',                                                               12, true, 19),
  ('builtin-point_intros-la-del-mono-colorado',        'La Del Moño Colorado',                                'point_intros', 'local', 'point_intros/La del Mono Colorado.mp3',                                                   12, true, 20),
  ('builtin-point_intros-la-gallina',                  'La Gallina',                                          'point_intros', 'local', 'point_intros/La Gallina.mp3',                                                             12, true, 21),
  ('builtin-point_intros-la-vaca',                     'La Vaca',                                             'point_intros', 'local', 'point_intros/La Vaca.mp3',                                                                12, true, 22),
  ('builtin-point_intros-levels-radio-edit',           'Levels (Radio Edit)',                                 'point_intros', 'local', 'point_intros/Levels - Radio Edit.mp3',                                                    12, true, 23),
  ('builtin-point_intros-light-it-up',                 'Light It Up',                                         'point_intros', 'local', 'point_intros/Light It Up.mp3',                                                            12, true, 24),
  ('builtin-point_intros-locked-out-of-heaven',        'Locked Out Of Heaven',                                'point_intros', 'local', 'point_intros/Locked out of Heaven.mp3',                                                   12, true, 25),
  ('builtin-point_intros-rebota',                      'Rebota',                                              'point_intros', 'local', 'point_intros/Rebota.mp3',                                                                 12, true, 26),
  ('builtin-point_intros-scooby-doo-pa-pa',            'Scooby Doo Pa Pa',                                    'point_intros', 'local', 'point_intros/Scooby Doo Pa Pa.mp3',                                                       12, true, 27),
  ('builtin-point_intros-selfie',                      'SELFIE',                                              'point_intros', 'local', 'point_intros/SELFIE.mp3',                                                                 12, true, 28),
  ('builtin-point_intros-tao-tao',                     'Tao, Tao',                                            'point_intros', 'local', 'point_intros/Tao, Tao.mp3',                                                               12, true, 29),
  ('builtin-point_intros-the-nights',                  'The Nights',                                          'point_intros', 'local', 'point_intros/The Nights.mp3',                                                             12, true, 30),
  ('builtin-point_intros-worth-it',                    'Worth It (feat. Kid Ink)',                             'point_intros', 'local', 'point_intros/Worth It (feat. Kid Ink).mp3',                                               12, true, 31),
  ('builtin-point_intros-y-que-fue',                   'Y Que Fue',                                           'point_intros', 'local', 'point_intros/Y Que Fue.mp3',                                                              12, true, 32),

-- ----------------------------------------------------------------
-- technical_timeouts  (60s)
-- ----------------------------------------------------------------
  ('builtin-technical_timeouts-ahora-te-puedes-marchar',    'Ahora Te Puedes Marchar',         'technical_timeouts', 'local', 'technical_timeouts/Ahora Te Puedes Marchar.mp3',              60, true,  1),
  ('builtin-technical_timeouts-arrempujala-arremangala',    'Arrempujala Arremangala',         'technical_timeouts', 'local', 'technical_timeouts/Arrempujala Arremangala.mp3',              60, true,  2),
  ('builtin-technical_timeouts-baila-esta-cumbia',          'Baila Esta Cumbia',               'technical_timeouts', 'local', 'technical_timeouts/Baila Esta Cumbia.mp3',                   60, true,  3),
  ('builtin-technical_timeouts-bailan-rochas-y-chetas',     'Bailan Rochas Y Chetas',          'technical_timeouts', 'local', 'technical_timeouts/Bailan Rochas y Chetas.mp3',              60, true,  4),
  ('builtin-technical_timeouts-chihuahua',                  'Chihuahua',                       'technical_timeouts', 'local', 'technical_timeouts/Chihuahua.mp3',                           60, true,  5),
  ('builtin-technical_timeouts-conga',                      'Conga',                           'technical_timeouts', 'local', 'technical_timeouts/Conga.mp3',                               60, true,  6),
  ('builtin-technical_timeouts-el-apagon',                  'El Apagón',                       'technical_timeouts', 'local', 'technical_timeouts/El Apagon.mp3',                           60, true,  7),
  ('builtin-technical_timeouts-el-mariachi-loco',           'El Mariachi Loco',                'technical_timeouts', 'local', 'technical_timeouts/El Mariachi Loco.mp3',                    60, true,  8),
  ('builtin-technical_timeouts-el-meneaito-panama',         'El Meneaito (Panama)',            'technical_timeouts', 'local', 'technical_timeouts/El Meneaito (Panama).mp3',                60, true,  9),
  ('builtin-technical_timeouts-el-rey',                     'El Rey',                          'technical_timeouts', 'local', 'technical_timeouts/El Rey.mp3',                              60, true, 10),
  ('builtin-technical_timeouts-gasolina',                   'Gasolina',                        'technical_timeouts', 'local', 'technical_timeouts/Gasolina.mp3',                            60, true, 11),
  ('builtin-technical_timeouts-guallando',                  'Guallando',                       'technical_timeouts', 'local', 'technical_timeouts/Guallando.mp3',                           60, true, 12),
  ('builtin-technical_timeouts-la-chona',                   'La Chona',                        'technical_timeouts', 'local', 'technical_timeouts/La Chona.mp3',                            60, true, 13),
  ('builtin-technical_timeouts-la-duena-del-swing',         'La Dueña Del Swing',              'technical_timeouts', 'local', 'technical_timeouts/La Duena del Swing.mp3',                  60, true, 14),
  ('builtin-technical_timeouts-la-mujer-del-pelotero',      'La Mujer Del Pelotero',           'technical_timeouts', 'local', 'technical_timeouts/La Mujer del Pelotero.mp3',               60, true, 15),
  ('builtin-technical_timeouts-la-nina-fresa',              'La Niña Fresa',                   'technical_timeouts', 'local', 'technical_timeouts/La nina fresa.mp3',                       60, true, 16),
  ('builtin-technical_timeouts-la-noche-que-murio-chicago', 'La Noche Que Murió Chicago',      'technical_timeouts', 'local', 'technical_timeouts/La Noche Que Murio Chicago.mp3',          60, true, 17),
  ('builtin-technical_timeouts-macarena-river-remix',       'Macarena (River Re-Mix 103 BPM)', 'technical_timeouts', 'local', 'technical_timeouts/Macarena - River Re-Mix 103 BPM.mp3',     60, true, 18),
  ('builtin-technical_timeouts-mayonesa',                   'Mayonesa',                        'technical_timeouts', 'local', 'technical_timeouts/Mayonesa.mp3',                            60, true, 19),
  ('builtin-technical_timeouts-payaso-de-rodeo',            'Payaso De Rodeo',                 'technical_timeouts', 'local', 'technical_timeouts/Payaso de rodeo.mp3',                     60, true, 20),
  ('builtin-technical_timeouts-que-calor',                  'Que Calor',                       'technical_timeouts', 'local', 'technical_timeouts/Que Calor.mp3',                           60, true, 21),
  ('builtin-technical_timeouts-que-nadie-sepa-mi-sufrir',   'Que Nadie Sepa Mi Sufrir',        'technical_timeouts', 'local', 'technical_timeouts/Que Nadie Sepa Mi Sufrir.mp3',            60, true, 22),
  ('builtin-technical_timeouts-sangoloteadito',             'Sangoloteadito',                  'technical_timeouts', 'local', 'technical_timeouts/Sangoloteadito.mp3',                      60, true, 23),
  ('builtin-technical_timeouts-scooby-doo-pa-pa',           'Scooby Doo Pa Pa',                'technical_timeouts', 'local', 'technical_timeouts/Scooby Doo Pa Pa.mp3',                    60, true, 24),
  ('builtin-technical_timeouts-titi-me-pregunto',           'Tití Me Preguntó',                'technical_timeouts', 'local', 'technical_timeouts/Titi Me Pregunto.mp3',                    60, true, 25),
  ('builtin-technical_timeouts-veo-veo',                    'Veo Veo',                         'technical_timeouts', 'local', 'technical_timeouts/Veo Veo.mp3',                             60, true, 26),
  ('builtin-technical_timeouts-wepa',                       'Wepa',                            'technical_timeouts', 'local', 'technical_timeouts/Wepa.mp3',                                60, true, 27),
  ('builtin-technical_timeouts-yo-las-pongo',               'Yo Las Pongo',                    'technical_timeouts', 'local', 'technical_timeouts/Yo Las Pongo.mp3',                        60, true, 28),
  ('builtin-technical_timeouts-yo-perreo-sola',             'Yo Perreo Sola',                  'technical_timeouts', 'local', 'technical_timeouts/Yo Perreo Sola.mp3',                      60, true, 29),

-- ----------------------------------------------------------------
-- super_spike  (12s)
-- ----------------------------------------------------------------
  ('builtin-super_spike-here-comes-the-boom',
   'Here Comes The Boom (DJ Stari & DJ Tobi Rudig Remix)',
   'super_spike', 'local',
   'super_spike/The Beachballs, DJ Stari, DJ Tobi Rudig - Here Comes The Boom - DJ Stari _ DJ Tobi Rudig Remix (SPOTISAVER).mp3',
   12, true, 1),

-- ----------------------------------------------------------------
-- monster_block  (12s)
-- ----------------------------------------------------------------
  ('builtin-monster_block-aggressive-electronic',
   'Agressive Electronic',
   'monster_block', 'local',
   'monster_block/Agressive Electronic.mp3',
   12, true, 1)

ON CONFLICT (id) DO UPDATE SET
  title          = EXCLUDED.title,
  storage_path   = EXCLUDED.storage_path,
  duration       = EXCLUDED.duration,
  playlist_order = EXCLUDED.playlist_order;
