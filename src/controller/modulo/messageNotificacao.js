
const NOTIFICACOES = {
    // ===================== FINANCEIRO (1-10) =====================
    1: {
        categoria: 'FINANCEIRO', chave: 'DICA_ECONOMIA',
        icone: '💡', nome: 'Dica para economizar',
        conteudo: 'Pequenas mudanças nos seus hábitos podem fazer uma grande diferença no seu orçamento. Confira nossas dicas!',
        referencia: null
    },
    2: {
        categoria: 'FINANCEIRO', chave: 'CONTROLE_GASTOS',
        icone: '💰', nome: 'Fique de olho nos gastos',
        conteudo: 'Que tal revisar seus gastos recentes e descobrir onde você pode economizar?',
        referencia: null
    },
    3: {
        categoria: 'FINANCEIRO', chave: 'PLANEJAMENTO',
        icone: '📊', nome: 'Organize suas finanças',
        conteudo: 'Um bom planejamento financeiro é o primeiro passo para alcançar seus objetivos. Organize seu orçamento!',
        referencia: null
    },
    4: {
        categoria: 'FINANCEIRO', chave: 'RESERVA',
        icone: '🛡️', nome: 'Construa sua reserva',
        conteudo: 'Ter uma reserva de emergência pode ajudar você a lidar com imprevistos. Comece com o que puder!',
        referencia: null
    },
    5: {
        categoria: 'FINANCEIRO', chave: 'EDUCACAO',
        icone: '📚', nome: 'Aprenda algo novo',
        conteudo: 'Conhecimento financeiro também é investimento! Explore novos conteúdos e aprimore suas decisões.',
        referencia: null
    },
    6: {
        categoria: 'FINANCEIRO', chave: 'META_CONCLUIDA',
        icone: '🎉', nome: 'Meta concluída!',
        conteudo: 'Parabéns! Você alcançou uma das suas metas financeiras. Que tal definir a próxima?',
        referencia: 'meta'
    },
    7: {
        categoria: 'FINANCEIRO', chave: 'META_PRAZO_PROXIMO',
        icone: '⏰', nome: 'Sua meta está chegando ao prazo',
        conteudo: 'A data alvo de uma das suas metas está próxima. Confira como está o seu progresso!',
        referencia: 'meta'
    },

    // =================== INVESTIMENTOS (11-20) ===================
    11: {
        categoria: 'INVESTIMENTOS', chave: 'OPORTUNIDADE',
        icone: '📈', nome: 'Explore novas oportunidades',
        conteudo: 'Existem diferentes formas de fazer seu dinheiro crescer. Conheça as possibilidades disponíveis!',
        referencia: null
    },
    12: {
        categoria: 'INVESTIMENTOS', chave: 'DIVERSIFICACAO',
        icone: '💹', nome: 'Diversifique seus investimentos',
        conteudo: 'Conhecer diferentes alternativas pode ajudar você a construir uma estratégia de investimentos mais equilibrada.',
        referencia: null
    },
    13: {
        categoria: 'INVESTIMENTOS', chave: 'PERFIL',
        icone: '🎯', nome: 'Conheça seu perfil investidor',
        conteudo: 'Entender seu perfil de investidor é importante para tomar decisões mais conscientes.',
        referencia: null
    },
    14: {
        categoria: 'INVESTIMENTOS', chave: 'ATENCAO',
        icone: '⚠️', nome: 'Invista com consciência',
        conteudo: 'Antes de investir, conheça os riscos, os custos e as características da aplicação.',
        referencia: null
    },
    15: {
        categoria: 'INVESTIMENTOS', chave: 'NOVA_OPORTUNIDADE',
        icone: '🔎', nome: 'Nova oportunidade disponível',
        conteudo: 'Uma nova oportunidade de investimento foi adicionada. Confira os detalhes antes de decidir!',
        referencia: 'oportunidade'
    },

    // ===================== COMUNIDADE (21-40) =====================
    // Publicações
    21: {
        categoria: 'COMUNIDADE', chave: 'NOVA_CURTIDA',
        icone: '❤️', nome: 'Nova curtida',
        conteudo: '{nome_usuario} curtiu sua publicação.',
        referencia: 'post'
    },
    22: {
        categoria: 'COMUNIDADE', chave: 'NOVO_COMENTARIO',
        icone: '💬', nome: 'Novo comentário',
        conteudo: '{nome_usuario} comentou na sua publicação.',
        referencia: 'post'
    },
    23: {
        categoria: 'COMUNIDADE', chave: 'POST_COMPARTILHADO',
        icone: '🔁', nome: 'Publicação compartilhada',
        conteudo: '{nome_usuario} compartilhou sua publicação.',
        referencia: 'post'
    },
    24: {
        categoria: 'COMUNIDADE', chave: 'POST_EM_DESTAQUE',
        icone: '🌟', nome: 'Publicação em destaque',
        conteudo: 'Sua publicação está recebendo destaque na comunidade!',
        referencia: 'post'
    },
    25: {
        categoria: 'COMUNIDADE', chave: 'POST_SALVO',
        icone: '🔖', nome: 'Publicação salva',
        conteudo: '{nome_usuario} salvou sua publicação.',
        referencia: 'post'
    },

    // Comentários
    26: {
        categoria: 'COMUNIDADE', chave: 'CURTIDA_COMENTARIO',
        icone: '❤️', nome: 'Curtiram seu comentário',
        conteudo: '{nome_usuario} curtiu seu comentário.',
        referencia: 'comentario'
    },
    27: {
        categoria: 'COMUNIDADE', chave: 'RESPOSTA_COMENTARIO',
        icone: '↩️', nome: 'Nova resposta',
        conteudo: '{nome_usuario} respondeu ao seu comentário.',
        referencia: 'comentario'
    },

    // Relacionamento entre usuários
    28: {
        categoria: 'COMUNIDADE', chave: 'NOVO_SEGUIDOR',
        icone: '👤', nome: 'Novo seguidor',
        conteudo: '{nome_usuario} começou a seguir você.',
        referencia: null
    },
    29: {
        categoria: 'COMUNIDADE', chave: 'SUGESTAO_USUARIO',
        icone: '🤝', nome: 'Conheça novas pessoas',
        conteudo: 'Existem pessoas com interesses financeiros semelhantes aos seus na comunidade!',
        referencia: null
    },

    // Menções e interações
    30: {
        categoria: 'COMUNIDADE', chave: 'NOVA_MENCAO',
        icone: '📣', nome: 'Mencionaram você',
        conteudo: '{nome_usuario} mencionou você em uma publicação.',
        referencia: 'post'
    },
    31: {
        categoria: 'COMUNIDADE', chave: 'RESPOSTA_PUBLICACAO',
        icone: '💬', nome: 'Responderam sua publicação',
        conteudo: '{nome_usuario} respondeu à sua publicação.',
        referencia: 'post'
    },
    32: {
        categoria: 'COMUNIDADE', chave: 'NOVA_INTERACAO',
        icone: '🔔', nome: 'Nova interação',
        conteudo: 'Você recebeu uma nova interação na comunidade.',
        referencia: null
    },

    // Atividade da comunidade
    33: {
        categoria: 'COMUNIDADE', chave: 'DISCUSSAO_POPULAR',
        icone: '🔥', nome: 'Assunto em destaque',
        conteudo: 'Uma discussão interessante está acontecendo na comunidade. Participe!',
        referencia: 'post'
    },
    34: {
        categoria: 'COMUNIDADE', chave: 'NOVAS_PUBLICACOES',
        icone: '📰', nome: 'Novidades na comunidade',
        conteudo: 'Confira as novas publicações e descubra o que outros usuários estão compartilhando.',
        referencia: null
    },
    35: {
        categoria: 'COMUNIDADE', chave: 'PARTICIPACAO',
        icone: '🌎', nome: 'Sua participação importa',
        conteudo: 'Compartilhe suas experiências financeiras e ajude outras pessoas a aprender!',
        referencia: null
    },
    36: {
        categoria: 'COMUNIDADE', chave: 'CONQUISTA_COMPARTILHADA',
        icone: '🏆', nome: 'Conquista compartilhada',
        conteudo: '{nome_usuario} compartilhou uma conquista na comunidade.',
        referencia: null
    },

    // Moderação
    37: {
        categoria: 'COMUNIDADE', chave: 'PUBLICACAO_REMOVIDA',
        icone: '🚫', nome: 'Publicação removida',
        conteudo: 'Sua publicação foi removida por não atender às diretrizes da comunidade.',
        referencia: 'post'
    },
    38: {
        categoria: 'COMUNIDADE', chave: 'COMENTARIO_REMOVIDO',
        icone: '⚠️', nome: 'Comentário removido',
        conteudo: 'Seu comentário foi removido por não atender às diretrizes da comunidade.',
        referencia: 'comentario'
    },
    39: {
        categoria: 'COMUNIDADE', chave: 'DENUNCIA_ATUALIZADA',
        icone: '⚠️', nome: 'Atualização sobre denúncia',
        conteudo: 'Houve uma atualização sobre uma denúncia realizada por você.',
        referencia: null
    },

    // ================= CONQUISTAS E GAMIFICAÇÃO (41-50) =================
    41: {
        categoria: 'CONQUISTAS', chave: 'XP_RECEBIDO',
        icone: '⭐', nome: 'Você ganhou XP!',
        conteudo: 'Você recebeu XP por suas atividades no FIMAP. Continue participando!',
        referencia: null
    },
    42: {
        categoria: 'CONQUISTAS', chave: 'NOVO_NIVEL',
        icone: '🆙', nome: 'Novo nível alcançado!',
        conteudo: 'Parabéns! Sua dedicação fez você alcançar um novo nível. Continue evoluindo!',
        referencia: null
    },
    43: {
        categoria: 'CONQUISTAS', chave: 'BADGE_DESBLOQUEADA',
        icone: '🏅', nome: 'Nova conquista desbloqueada!',
        conteudo: 'Você desbloqueou uma nova conquista! Confira sua coleção de badges.',
        referencia: null
    },
    44: {
        categoria: 'CONQUISTAS', chave: 'DESAFIO_CONCLUIDO',
        icone: '🏆', nome: 'Desafio concluído!',
        conteudo: 'Parabéns por concluir mais um desafio! Sua dedicação está fazendo a diferença.',
        referencia: null
    },
    45: {
        categoria: 'CONQUISTAS', chave: 'NOVO_DESAFIO',
        icone: '🎯', nome: 'Novo desafio disponível!',
        conteudo: 'Tem um novo desafio esperando por você. Participe e continue acumulando XP!',
        referencia: null
    },
    46: {
        categoria: 'CONQUISTAS', chave: 'PROXIMA_CONQUISTA',
        icone: '🔥', nome: 'Você está quase lá!',
        conteudo: 'Falta pouco para desbloquear sua próxima conquista. Continue participando!',
        referencia: null
    },
    47: {
        categoria: 'CONQUISTAS', chave: 'RANKING',
        icone: '🥇', nome: 'Você subiu no ranking!',
        conteudo: 'Sua dedicação está trazendo resultados. Confira sua posição no ranking!',
        referencia: null
    },
    48: {
        categoria: 'CONQUISTAS', chave: 'SEQUENCIA',
        icone: '⚡', nome: 'Continue sua jornada!',
        conteudo: 'Mantenha sua participação no FIMAP e avance cada vez mais nas suas conquistas.',
        referencia: null
    },

    // ===================== MOTIVAÇÃO (51-60) =====================
    51: {
        categoria: 'MOTIVACAO', chave: 'COMECO',
        icone: '🌱', nome: 'Todo começo importa',
        conteudo: 'Você não precisa ter tudo planejado para começar. Pequenas atitudes podem transformar sua vida financeira.',
        referencia: null
    },
    52: {
        categoria: 'MOTIVACAO', chave: 'CONSTANCIA',
        icone: '🔥', nome: 'Mantenha a constância',
        conteudo: 'Construir uma vida financeira saudável é um processo. Continue avançando no seu ritmo!',
        referencia: null
    },
    53: {
        categoria: 'MOTIVACAO', chave: 'OBJETIVOS',
        icone: '🎯', nome: 'Seus objetivos merecem atenção',
        conteudo: 'Não perca de vista aquilo que você deseja conquistar. Continue planejando seu futuro!',
        referencia: null
    },
    54: {
        categoria: 'MOTIVACAO', chave: 'FUTURO',
        icone: '🌟', nome: 'Pense no seu futuro',
        conteudo: 'As decisões financeiras de hoje podem abrir novas possibilidades para o seu amanhã.',
        referencia: null
    }
}

module.exports = NOTIFICACOES