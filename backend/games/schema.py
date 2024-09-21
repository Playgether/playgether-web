from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .serializers import CategorySerializer, GameSerializer, CompaniesSerializer
from myapp.serializers import ProfileSerializer

game_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model Game (Game VIEW) do app de Games",
    description="Gerencia os objetos do model Game realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados todos os jogos da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do Game)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)

profile_game_lol_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model ProfileGameLol (ProfileGameLol VIEW) do app de Games",
    description="Gerencia os objetos do model ProfileGameLol realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciadas as informações de League of Legends dos perfis da aplicação.
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o objeto (Id do ProfileGameLol)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)

companies_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de exclusão / atualização de dados do model Company (COMPANYY VIEW) do app de Games",
    description="Gerencia os objetos do model Company realizando PUT, DELETE E PATCH."     
   """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciadas as empresas que criam os jogos (RIOT, VALVE, EPICGAMES...)
    """
    ,    
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica a companhia (Id da companhia)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH
        ),
    ]
)

companies_games_schema = extend_schema(
    responses={200: GameSerializer(many=True)},
    summary="Retorna todos os games associados a uma compania (RIOT, VALVE, EPIC GAMES...)",
    description="Endpoint pertecente a view de companhia de jogos (COMPANY VIEW no app de games)"        
    """

        A responsabilidade deste endpoint é retornar todos os jogos pertencentes a alguma companhia de jogos como por exemplo: todos os jogos da riot, valve, epicgames, etc.

        Ele recebe um id de uma companhia e retorna um json com todos os games que pertencem a mesma
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica a companhia (Id da companhia)",
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

games_profiles_schema = extend_schema(
    responses={200: ProfileSerializer(many=True)},
    summary="Retorna todos os perfil associados a um game",
    description="Endpoint pertecente a view de games (GAME VIEW no app de games)"        
    """

        A responsabilidade deste endpoint é retornar todos os perfis associados a algum jogo, como por exemplo: todos os perfis que jogam lol, cs, valorant, etc.

        Ele recebe um id de um jogo e retorna um json com todos os perfis associados ao mesmo
    """,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica o jogo (Id do game)",
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


categories_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    responses={200: CategorySerializer},
    summary="Pertence as operações de exclusão / atualização de dados do model Category (CATEGORY VIEW) do app de Games",
    description="Gerencia os objetos do model Category realizando PUT, DELETE E PATCH."
        """

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são gerenciados os estilos possíveis para algum game (MOBA, FPS, RPG...)
        """
    ,
    parameters=[
        OpenApiParameter(
            name="id",
            required=True,
            description="O Id único que identifica a categoria (Id da categoria)",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
        ),
    ]
)

game_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model Game (Game View) do app de Games",
    description=
        "Retorna todos os objeto(s) do model Game do app de Games."
        """

        Pode receber um id opcional em '/api/v1/games/{id}', caso receba, retorna um objeto específico (objeto de GameView), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciados todos os jogos da aplicação.
        """
    ,
    parameters=[]
)

profile_game_lol_schema_GET = extend_schema(
    methods=["GET"],
    summary="Pertence as operações de leitura de dados do model ProfileGameLol (ProfileGameLol View) do app de Games",
    description=
        "Retorna todos os objeto(s) do model ProfileGameLol do app de Games."
        """

        Pode receber um id opcional em '/games/profiles/info/lol/{id}', caso receba, retorna um objeto específico (objeto de ProfileGameLolView), caso não receba, retorna todos os objetos disponíveis.

        Nesta view são gerenciadas as informações de League of Legends dos perfis da aplicação.
        """
    ,
    parameters=[]
)

companies_schema_GET = extend_schema(
    methods=["GET"],
    responses={200: CompaniesSerializer},
    summary="Pertence as operações de leitura de dados do model Company (Company View) do app de Games",
    description=
        "Retorna todos os objeto(s) do model Company do app de Games."
        """

        Pode receber um id opcional em '/companies/{id}', caso receba, retorna uma compania específica, caso não receba, retorna todas as companias disponíveis.

        Nesta view são gerenciadas as empresas donas de algum game (RIOT, VALVE, EPICGAMES...)
        """
    ,
    parameters=[]
)

categories_schema_GET = extend_schema(
    methods=["GET"],
    responses={200: CategorySerializer},
    summary="Pertence as operações de leitura de dados do model Category (CATEGORY VIEW) do app de Games",
    description=
        "Retorna todos os objeto(s) do model Category do app de Games."
        """

        Pode receber um id opcional em '/categories/{id}', caso receba, retorna uma categoria específica, caso não receba, retorna todas as categorias disponíveis.

        Nesta view são gerenciados os estilos possíveis para algum game (MOBA, FPS, RPG...)
        """
    ,
    parameters=[]
)

profile_game_lol_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model ProfileGameLol (ProfileGameLol View) do app de Games",
    description=
        "Cria um objeto do model ProfileGameLol do app de Games."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciadas as informações de League of Legends dos perfis da aplicação.
        """
    ,
    parameters=[]
)

game_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Game (Game View) do app de Games",
    description=
        "Cria um objeto do model Game do app de Games."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201
        
        Nesta view são gerenciados todos os jogos da aplicação.
        """
    ,
    parameters=[]
)

companies_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Company (Company View) do app de Games",
    description=
        "Cria um objeto do model Company do app de Games."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201

        Nesta view são gerenciadas as empresas donas de algum game (RIOT, VALVE, EPICGAMES...)
        """
    ,
    parameters=[]
)

categories_schema_POST = extend_schema(
    methods=["POST"],
    summary="Pertence as operações de inserção de dados do model Category (CATEGORY VIEW) do app de Games",
    description=
        "Cria um objeto do model Category do app de Games."
        """

        Recebe um JSON com as informações necessárias para cadastrar o objeto, cadastra o objeto e então retorna o objeto e um código HTTP 201

        Nesta view são gerenciados os estilos possíveis para algum game (MOBA, FPS, RPG...)
        """
    ,
    parameters=[]
)

categories_games_schema = extend_schema(
    methods=['GET'],
    responses={200: GameSerializer(many=True)},
    summary="Retorna todos os games associados a uma categoria (MOBA, FPS, RPG...)",
    description= "Endpoint pertecente a view de categoria de jogos (CATEGORY VIEW no app de games)"    
        """

        A responsabilidade deste endpoint é retornar todos os jogos pertencentes a alguma categoria de jogos como por exemplo: todos os jogos de moba, fps, rpg, etc.

        Ele recebe um id de uma categoria e retorna um json com todos os games que pertencem a mesma
        """,
    parameters=[
        OpenApiParameter(
            name="id",
            description="O ID que identifica a categoria específica que estamos procurando os jogos.",
            required=True,
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
        ),
        OpenApiParameter(
            name="page",
            description="Um número de página no conjunto de resultados paginados",
            type=OpenApiTypes.INT,
        )
    ]
)