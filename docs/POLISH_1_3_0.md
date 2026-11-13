# Alpha 1.3.0 — consolidação de combate, mobile e mundo

Candidata de 13/11/2026. Mantém schema 13 e base 1.1.2 intacta.

## Entregue

- Preview dos capítulos 2/3 e painel QA salvam em chave própria; Continuar permanece na jornada normal. Retomar teste e recuperação de backup nas opções.
- Backup antes de nova jornada/importação e atributos do preview normalizados antes do checkpoint.
- Catálogo compartilhado de ações P1/P2 para seis personagens, com recargas, guardas, combos, Iai, campos e ataques agendados por ator. Sem trocar coordenadas globais para executar habilidades.
- Ajustes de combate usam o mesmo kit em ambos os jogadores; guardas e efeitos são limpos nas transições/checkpoints e pausam nos menus.
- Prompts por teclado/toque/controle, ajuda dos seis kits e versão centralizada.
- Mobile com nomes e recargas das habilidades, estado de recurso insuficiente, opções persistentes de tamanho/opacidade/lateralidade/texto e controles recolhidos nos menus.
- Pisos de rua, metal, clube, santuário e arena final separados das ilustrações arquitetônicas. Nuvens com clusters contínuos e bordas por vizinhança.
- Palco, equipamento, mesas e bar com desenho pixelado e estados de energia/show; atores existentes preservados.
- Primeiro contato com Belga identificado como rádio. Reunião no clube entrega a flauta com Colli/Mazza presentes, eliminando uma viagem de confirmação; aquisição anterior na oficina permanece compatível.
- Gerador protege Base64 antes de renomear colaboradores. A trilha original walk_talk_twin era válida na base; as substituições globais corrompiam dados na build. Todos os áudios originais agora são preservados byte a byte.
- Workflow passa a construir, validar e executar regressões antes de exportar/publicar.

## Evidência

103 verificações estruturais; 32 contratos dirigidos de combate; seis de UI; contratos de save e mundo; sintaxe do script completo; identidade de todas as trilhas originais; exportação web com reconstrução byte a byte.

Navegador: opções e sessão de teste; abertura por rádio; exploração Terminal → Distrito → Contratempo; layout mobile em retrato/paisagem; técnicas e rolada do Sintetizador no cenário dirigido do chefe final; derrota e Tentar novamente recuperando formação e diálogo sem travar. Console consultado sem erros/avisos capturados. Capturas em qa/alpha-1.3.0/.

O Artista participou da revisão estática e do ajuste dos clusters de nuvem. A sessão própria de navegador do Artista não estava disponível; a inspeção visual integrada foi feita pelo agente principal. Isto não é um aceite visual independente completo.

## Limites e trabalho restante para Beta

- Não foi executada uma jornada integral sem ferramentas QA nesta candidata.
- Dois controles físicos, Safari iOS/Android, multitouch físico e ergonomia real continuam pendentes.
- Não há medição suficiente para afirmar 60 FPS estáveis ou memória adequada em celulares de entrada.
- Balanceamento dos seis kits e de todas as formações precisa de tentativas reais dos chefes.
- A redução de deslocamento foi aplicada ao retorno da flauta no capítulo 3; não houve corte amplo do roteiro dos capítulos 1/2.
- Não foram produzidas novas famílias de sprites raster nem redesenhados todos os NPCs. A integração visual desta candidata usa a arte existente e desenho Canvas.
- Não representa a conclusão de todos os itens do diagnóstico ou uma Beta aprovada. Backlog futuro: variantes de inimigos, revisão completa de ritmo dos capítulos 1/2, animações narrativas adicionais, mixagem auditiva e validação integral de saves legados reais.

## Reproduzir

Ruby para gerar/validar/exportar; Node 22 para testes:

```sh
ruby game/source/chapter-03/build_alpha.rb
ruby game/source/chapter-03/validate_alpha.rb
node qa/polish/run.cjs
ruby production/build_playtest.rb
```

O HTML portátil fica em game/builds/alpha-1.3.0/. O site original do Ryusarto não é alterado por um commit neste fork. Publicação Pages depende da configuração do fork.

O envio pelo conector inclui fontes, manifesto e relatórios. O HTML portátil grande é entregue localmente e gerado como artefato da Actions, evitando repetir mídia no histórico. O build gera a pasta ausente antes da validação. A configuração Pages é opcional no fork; se indisponível, o artefato portátil continua disponível.
