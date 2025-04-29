
import datetime
from datetime import timezone
from db.base import Base, engine, SessionLocal

from db.entries.User import User
from db.entries.Recipe import Recipe
from db.entries.Ingredient import Ingredient
from db.entries.Step import Step
from db.entries.RecipeIngredient import RecipeIngredient

def get_utc_now():
    """Get current UTC time"""
    return datetime.datetime.now(timezone.utc)

def reset_database():
    """Drop all tables and recreate them"""
    print("Dropping all tables...")
    Base.metadata.drop_all(engine)
    print("Creating all tables...")
    Base.metadata.create_all(engine)

def create_tables():
    """Create all tables if they don't exist"""
    Base.metadata.create_all(engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_database():
    """
    Seed the database with initial test data.
    """
    session = SessionLocal()
    
    try:
        print("Seeding database...")
        
        print("Creating users...")
        admin = User(
            username="admin", 
            email="admin@example.com"
        )
        admin.password = "Admin123!"  # Will be automatically hashed
        
        chef_john = User(
            username="chef_john", 
            email="chef@example.com"
        )
        chef_john.password = "ChefJohn123!"
        
        home_cook = User(
            username="home_cook", 
            email="cook@example.com"
        )
        home_cook.password = "HomeCook123!"
        
        session.add_all([admin, chef_john, home_cook])
        session.flush()  # Flush to get IDs
        
        print("Creating ingredients...")
        ingredients = [
            Ingredient(name="Salt", unit="g"),
            Ingredient(name="Pepper", unit="g"),
            Ingredient(name="Olive oil", unit="ml"),
            Ingredient(name="Chicken breast", unit="g"),
            Ingredient(name="Garlic", unit="clove"),
            Ingredient(name="Onion", unit="pcs"),
            Ingredient(name="Tomato", unit="pcs"),
            Ingredient(name="Pasta", unit="g"),
            Ingredient(name="Parmesan cheese", unit="g"),
            Ingredient(name="Basil", unit="g"),
            Ingredient(name="Flour", unit="g"),
            Ingredient(name="Sugar", unit="g"),
            Ingredient(name="Eggs", unit="pcs"),
            Ingredient(name="Butter", unit="g"),
            Ingredient(name="Milk", unit="ml"),
        ]
        session.add_all(ingredients)
        session.flush()
        
        print("Creating recipes...")
        pasta_recipe = Recipe(
            title="Classic Spaghetti Carbonara",
            description="A traditional Italian pasta dish with eggs, cheese, pancetta, and pepper.",
            is_public=True,
            preparation_time=15,
            cooking_time=20,
            servings=4,
            user_id=chef_john.id
        )
        
        chicken_recipe = Recipe(
            title="Garlic Butter Chicken",
            description="Juicy chicken breasts cooked in a garlic butter sauce.",
            is_public=True,
            preparation_time=10,
            cooking_time=30,
            servings=2,
            user_id=home_cook.id
        )
        
        cookie_recipe = Recipe(
            title="Chocolate Chip Cookies",
            description="Classic homemade chocolate chip cookies that are soft and chewy.",
            is_public=True,
            preparation_time=20,
            cooking_time=15,
            servings=24,
            user_id=admin.id
        )
        
        session.add_all([pasta_recipe, chicken_recipe, cookie_recipe])
        session.flush()
        
        print("Creating recipe steps...")
        pasta_steps = [
            Step(
                recipe_id=pasta_recipe.id,
                order_number=1,
                action_type="prep",
                temperature=0,
                speed=0,
                duration=5,
                description="Bring a large pot of salted water to boil."
            ),
            Step(
                recipe_id=pasta_recipe.id,
                order_number=2,
                action_type="cook",
                temperature=100,
                speed=0,
                duration=10,
                description="Cook pasta according to package instructions until al dente."
            ),
            Step(
                recipe_id=pasta_recipe.id,
                order_number=3,
                action_type="mix",
                temperature=0,
                speed=2,
                duration=3,
                description="In a bowl, whisk eggs and grated cheese."
            ),
            Step(
                recipe_id=pasta_recipe.id,
                order_number=4,
                action_type="cook",
                temperature=80,
                speed=1,
                duration=5,
                description="Mix the egg mixture with the hot pasta to create a creamy sauce."
            )
        ]
        
        chicken_steps = [
            Step(
                recipe_id=chicken_recipe.id,
                order_number=1,
                action_type="prep",
                temperature=0,
                speed=0,
                duration=5,
                description="Season chicken breasts with salt and pepper."
            ),
            Step(
                recipe_id=chicken_recipe.id,
                order_number=2,
                action_type="cook",
                temperature=180,
                speed=0,
                duration=15,
                description="Heat butter in a pan and cook chicken until golden brown on both sides."
            ),
            Step(
                recipe_id=chicken_recipe.id,
                order_number=3,
                action_type="cook",
                temperature=150,
                speed=0,
                duration=10,
                description="Add minced garlic and cook until fragrant."
            )
        ]
        
        cookie_steps = [
            Step(
                recipe_id=cookie_recipe.id,
                order_number=1,
                action_type="mix",
                temperature=0,
                speed=2,
                duration=5,
                description="Cream together butter and sugars until light and fluffy."
            ),
            Step(
                recipe_id=cookie_recipe.id,
                order_number=2,
                action_type="mix",
                temperature=0,
                speed=1,
                duration=2,
                description="Add eggs and vanilla, mix well."
            ),
            Step(
                recipe_id=cookie_recipe.id,
                order_number=3,
                action_type="mix",
                temperature=0,
                speed=1,
                duration=3,
                description="Gradually add flour mixture and mix until just combined."
            ),
            Step(
                recipe_id=cookie_recipe.id,
                order_number=4,
                action_type="cook",
                temperature=180,
                speed=0,
                duration=12,
                description="Bake in preheated oven until edges are golden brown."
            )
        ]
        
        all_steps = pasta_steps + chicken_steps + cookie_steps
        session.add_all(all_steps)
        session.flush() 
        
        print("Creating recipe ingredients...")
        pasta_ingredients = [
            RecipeIngredient(recipe_id=pasta_recipe.id, ingredient_id=ingredients[7].id, quantity=400, step_id=pasta_steps[1].id),  # Pasta
            RecipeIngredient(recipe_id=pasta_recipe.id, ingredient_id=ingredients[12].id, quantity=4, step_id=pasta_steps[2].id),    # Eggs
            RecipeIngredient(recipe_id=pasta_recipe.id, ingredient_id=ingredients[8].id, quantity=100, step_id=pasta_steps[2].id),  # Parmesan
            RecipeIngredient(recipe_id=pasta_recipe.id, ingredient_id=ingredients[0].id, quantity=5, step_id=pasta_steps[0].id),    # Salt
            RecipeIngredient(recipe_id=pasta_recipe.id, ingredient_id=ingredients[1].id, quantity=10, step_id=pasta_steps[3].id),   # Pepper
        ]
        
        chicken_ingredients = [
            RecipeIngredient(recipe_id=chicken_recipe.id, ingredient_id=ingredients[3].id, quantity=500, step_id=chicken_steps[0].id),  # Chicken
            RecipeIngredient(recipe_id=chicken_recipe.id, ingredient_id=ingredients[13].id, quantity=50, step_id=chicken_steps[1].id),  # Butter
            RecipeIngredient(recipe_id=chicken_recipe.id, ingredient_id=ingredients[4].id, quantity=3, step_id=chicken_steps[2].id),    # Garlic
            RecipeIngredient(recipe_id=chicken_recipe.id, ingredient_id=ingredients[0].id, quantity=5, step_id=chicken_steps[0].id),    # Salt
            RecipeIngredient(recipe_id=chicken_recipe.id, ingredient_id=ingredients[1].id, quantity=3, step_id=chicken_steps[0].id),    # Pepper
        ]
        
        cookie_ingredients = [
            RecipeIngredient(recipe_id=cookie_recipe.id, ingredient_id=ingredients[13].id, quantity=230, step_id=cookie_steps[0].id),  # Butter
            RecipeIngredient(recipe_id=cookie_recipe.id, ingredient_id=ingredients[11].id, quantity=200, step_id=cookie_steps[0].id),  # Sugar
            RecipeIngredient(recipe_id=cookie_recipe.id, ingredient_id=ingredients[12].id, quantity=2, step_id=cookie_steps[1].id),    # Eggs
            RecipeIngredient(recipe_id=cookie_recipe.id, ingredient_id=ingredients[10].id, quantity=350, step_id=cookie_steps[2].id),  # Flour
        ]
        
        all_recipe_ingredients = pasta_ingredients + chicken_ingredients + cookie_ingredients
        session.add_all(all_recipe_ingredients)
        
        session.commit()
        print("Database seeding completed successfully!")
        
    except Exception as e:
        session.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    reset_database()
    seed_database()