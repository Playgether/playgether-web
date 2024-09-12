from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .serializers import CategorySerializer, GameSerializer

companies_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    summary="Pertence as operações de inserção / atualização de dados do model Company (COMPANYY VIEW) do app de Games",
    description="Pertence as operações de inserção / atualização de dados do model Company (COMPANYY VIEW) do app de Games"     
   """
        Gerencia os objetos do model Company realizando PUT, DELETE E PATCH.

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são criados/retornados as empresas que criam os jogos (RIOT, VALVE, EPICGAMES...)
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

categories_schema = extend_schema(
    methods=['PUT', 'DELETE', 'PATCH'],
    responses={200: CategorySerializer},
    summary="Pertence as operações de inserção / atualização de dados do model Category (CATEGORY VIEW) do app de Games",
    description=(
        """
        Gerencia os objetos do model Category realizando PUT, DELETE E PATCH.

        Recebe um "id" que identifica este objeto e realiza a operação cujo o verbo HTTP foi requisitado.

        Nesta view são criados/retornados os estilos possíveis para algum game (MOBA, FPS, RPG...)
        """
    ),
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

categories_schema_GET = extend_schema(
    methods=['GET'],
    responses={200: CategorySerializer},
    summary="Pertence as operações de leitura de dados do model Category (CATEGORY VIEW) do app de Games",
    description=(
        """
        Retorna todos ou um objeto(s) do model Category do app de Games.

        Pode receber um id opcional em '/categories/{id}', caso receba, retorna uma categoria específica, caso não receba, retorna todas as categorias disponíveis.

        Nesta view são criados/retornados os estilos possíveis para algum game (MOBA, FPS, RPG...)
        """
    ),
    parameters=[]
)

categories_games_schema = extend_schema(
    methods=['GET'],
    responses={200: GameSerializer(many=True)},
    summary="Retorna todos os games associados a uma categoria (MOBA, FPS, RPG...)",
    description=       
        """
        Endpoint pertecente a view de categoria de jogos (CATEGORY VIEW no app de games)

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