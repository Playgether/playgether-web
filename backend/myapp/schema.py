from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from .serializers import (
    PostSerializer, 
    LikeSerializer, 
    ProfileSerializer, 
    UserSerializer,
    CommentSerializer
)
from games.serializers import (
    GameSerializer,
    ProfileGameLolSerializer
)

user_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model User (User VIEW) do app de myapp",
    description="Gerencia os objetos do model User realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados todos os usuários da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do User)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)
profile_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model Profile (Profile VIEW) do app de myapp",
    description="Gerencia os objetos do model Profile realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados todos os perfis da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do Profile)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)
likes_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model Like (Like VIEW) do app de myapp",
    description="Gerencia os objetos do model Like realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados todos os likes da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do Like)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)
posts_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model Post (Post VIEW) do app de Posts",
    description="Gerencia os objetos do model Post realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados todos os posts da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do Post)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)
comments_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model Coment (Coment VIEW) do app de myapp",
    description="Gerencia os objetos do model Coment realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados todos os comentários da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do Comment)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)

users_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model User (User View) do app myapp",
    description=
        "Cria um objeto do model User do app myapp."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciados os usuários da aplicação.
        """
    ,
    parameters=[]
)
profiles_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Profile (Profile View) do app myapp",
    description=
        "Cria um objeto do model Profile do app myapp."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciados os perfis da aplicação.
        """
    ,
    parameters=[]
)
likes_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Like (Like View) do app myapp",
    description=
        "Cria um objeto do model Like do app myapp."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciados os likes dos perfis da aplicação.
        """
    ,
    parameters=[]
)
comments_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Comment (Comment View) do app myapp",
    description=
        "Cria um objeto do model Comment do app myapp."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciados os comentários dos perfis da aplicação.
        """
    ,
    parameters=[]
)
posts_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Post (Post View) do app myapp",
    description=
        "Cria um objeto do model Post do app myapp."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciados os posts dos perfis da aplicação.
        """
    ,
    parameters=[]
)


users_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model User (User View) do app myapp",
    description=
        "Retorna todos os objeto(s) do model User do app myapp."
        """

        Pode receber um id opcional em '/api/v1/users/{id}', caso receba, retorna um objeto específico (objeto de User), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciados todos os usuários da aplicação.
        """
    ,
    parameters=[]
)
profiles_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model Profile (Profile View) do app myapp",
    description=
        "Retorna todos os objeto(s) do model Profile do app myapp."
        """

        Pode receber um id opcional em '/api/v1/profiles/{id}', caso receba, retorna um objeto específico (objeto de Profile), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciados todos os perfis da aplicação.
        """
    ,
    parameters=[]
)
likes_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model Like (Like View) do app myapp",
    description=
        "Retorna todos os objeto(s) do model Like do app myapp."
        """

        Pode receber um id opcional em '/api/v1/likes/{id}', caso receba, retorna um objeto específico (objeto de Like), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciados todos os likes da aplicação.
        """
    ,
    parameters=[]
)
comments_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model Comment (Comment View) do app myapp",
    description=
        "Retorna todos os objeto(s) do model Comment do app myapp."
        """

        Pode receber um id opcional em '/api/v1/comments/{id}', caso receba, retorna um objeto específico (objeto de Comment), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciados todos os comentários da aplicação.
        """
    ,
    parameters=[]
)
posts_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model Post (Post View) do app myapp",
    description=
        "Retorna todos os objeto(s) do model Post do app myapp."
        """

        Pode receber um id opcional em '/api/v1/posts/{id}', caso receba, retorna um objeto específico (objeto de Post), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciados todos os posts da aplicação.
        """
    ,
    parameters=[]
)



feed_schema = extend_schema(
    responses={200: PostSerializer(many=True)},
    summary="Retorna o feed de um usuário",
    description="Endpoint pertecente a view de posts (POST VIEW no app myapp)"        
    """

        A responsabilidade deste endpoint é retornar o feed de um usuário, ou seja, todos os posts dos perfis que ele segue.

        Ele recebe um id de um usuário e retorna um json com todos os posts dos perfis que ele segue, dos mais recentes para os mais antigos.
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o usuário (Id do perfil que deseja o feed)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)

post_likes_schema_GET = extend_schema(
    methods=["GET"],
    responses={200: LikeSerializer(many=True)},
    summary="Retorna os likes de algum post",
    description="Endpoint pertecente a view de posts (POST VIEW no app myapp)"        
    """

        A responsabilidade deste endpoint é retornar os likes de algum post.

        Ele recebe um id de um post e retorna um json com todos os likes deste post.
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o post (Id do Post)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)

post_likes_schema_DELETE = extend_schema(
    methods=["DELETE"],
    summary="Deleta o like de algum post",
    description="Endpoint pertecente a view de posts (POST VIEW no app myapp)"        
    """

        A responsabilidade deste endpoint é deletar o like de algum post.

        Ele recebe um id de um objeto Like (id de um like) e então deleta este like.
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o like (Id do Like)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)


profile_fetch_lol_schema = extend_schema(
    responses={200: OpenApiResponse(
                examples=[
                    {
                        "queueType": "RANKED_SOLO_5x5",
                        "tier": "BRONZE",
                        "rank": "IV",
                        "leaguePoints": 0,
                        "wins": 3,
                        "losses": 5,
                        "winRate": "38%"
                    },
                    {
                        "queueType": "RANKED_FLEX_SR",
                        "tier": "IRON",
                        "rank": "II",
                        "leaguePoints": 87,
                        "wins": 2,
                        "losses": 4,
                        "winRate": "33%"
                    }
                ],
                description="Retorno da API da Riot",
            )
        },
        summary="Retorna informações de jogo do lol relacionadas a algum perfil",
        description="Endpoint pertecente a view de profile (PROFILE VIEW no app myapp)"        
        """

            A responsabilidade deste endpoint é retornar informações de jogo do lol relacionadas a algum perfil, ou seja, seu elo, porcentagem de vitórias etc...

            Ele faz uma requisição para a API da Riot, e então retorna as informações recebidas, adicionando algumas novas

            Ele recebe um id de um objeto Profile (id de um profile) e então retorna os dados.
        """,
        parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o profile (Id do Profile)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)
profile_info_lol_schema = extend_schema(
    responses={200: ProfileGameLolSerializer(many=True)},
    summary="Retorna as informações de league of legends de algum profile",
    description="Endpoint pertecente a view de profile (PROFILE VIEW no app myapp)"        
    """

        A responsabilidade deste endpoint é retornar as informações de alguma conta de league of legends relacionados a algum perfil da aplicação.

        Ele recebe um id de um objeto Profile (id de um profile) e então retorna suas informações de league of legends.
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o profile (Id do Profile)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)
profile_games_schema = extend_schema(
    responses={200: GameSerializer(many=True)},
    summary="Retorna todos os games que um perfil joga",
    description="Endpoint pertecente a view de profile (PROFILE VIEW no app myapp)"        
    """

        A responsabilidade deste endpoint é retornar todos os jogos que algum profile esta associado.

        Ele recebe um id de um objeto Profile (id de um profile) e então retorna os games que este perfil joga.
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o profile (Id do Profile)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)
post_comments_schema = extend_schema(
    responses={200: CommentSerializer(many=True)},
    summary="Retorna todos os comentários de um post",
    description="Endpoint pertecente a view de posts (POST VIEW no app myapp)"        
    """

        A responsabilidade deste endpoint é retornar todos os comentários de algum post.

        Ele recebe um id de um objeto Post (id de um post) e então retorna seus comentários.
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o post (Id do Post)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)