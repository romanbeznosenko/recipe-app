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
    Seed the database with initial test data including categorized ingredients.
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

        print("Creating categorized ingredients...")
        ingredients = [
            # Vegetables
            Ingredient(name="Onion", unit="piece", category="vegetables"),
            Ingredient(name="Garlic", unit="clove", category="vegetables"),
            Ingredient(name="Tomato", unit="piece", category="vegetables"),
            Ingredient(name="Bell Pepper", unit="piece",
                       category="vegetables"),
            Ingredient(name="Carrot", unit="piece", category="vegetables"),
            Ingredient(name="Potato", unit="piece", category="vegetables"),
            Ingredient(name="Broccoli", unit="g", category="vegetables"),
            Ingredient(name="Spinach", unit="g", category="vegetables"),
            Ingredient(name="Mushrooms", unit="g", category="vegetables"),
            Ingredient(name="Zucchini", unit="piece", category="vegetables"),

            # Fruits
            Ingredient(name="Lemon", unit="piece", category="fruits"),
            Ingredient(name="Lime", unit="piece", category="fruits"),
            Ingredient(name="Apple", unit="piece", category="fruits"),
            Ingredient(name="Banana", unit="piece", category="fruits"),
            Ingredient(name="Orange", unit="piece", category="fruits"),
            Ingredient(name="Strawberries", unit="g", category="fruits"),
            Ingredient(name="Blueberries", unit="g", category="fruits"),

            # Meat & Poultry
            Ingredient(name="Chicken Breast", unit="g",
                       category="meat_poultry"),
            Ingredient(name="Chicken Thigh", unit="g",
                       category="meat_poultry"),
            Ingredient(name="Ground Beef", unit="g", category="meat_poultry"),
            Ingredient(name="Beef Steak", unit="g", category="meat_poultry"),
            Ingredient(name="Pork Chops", unit="g", category="meat_poultry"),
            Ingredient(name="Bacon", unit="g", category="meat_poultry"),
            Ingredient(name="Turkey", unit="g", category="meat_poultry"),

            # Seafood
            Ingredient(name="Salmon", unit="g", category="seafood"),
            Ingredient(name="Tuna", unit="g", category="seafood"),
            Ingredient(name="Shrimp", unit="g", category="seafood"),
            Ingredient(name="Cod", unit="g", category="seafood"),
            Ingredient(name="Mussels", unit="g", category="seafood"),

            # Dairy & Eggs
            Ingredient(name="Eggs", unit="piece", category="dairy"),
            Ingredient(name="Milk", unit="ml", category="dairy"),
            Ingredient(name="Butter", unit="g", category="dairy"),
            Ingredient(name="Cream", unit="ml", category="dairy"),
            Ingredient(name="Parmesan Cheese", unit="g", category="dairy"),
            Ingredient(name="Mozzarella Cheese", unit="g", category="dairy"),
            Ingredient(name="Cheddar Cheese", unit="g", category="dairy"),
            Ingredient(name="Greek Yogurt", unit="g", category="dairy"),
            Ingredient(name="Feta Cheese", unit="g", category="dairy"),

            # Grains & Cereals
            Ingredient(name="Pasta", unit="g", category="grains_cereals"),
            Ingredient(name="Rice", unit="g", category="grains_cereals"),
            Ingredient(name="Flour", unit="g", category="grains_cereals"),
            Ingredient(name="Bread", unit="slice", category="grains_cereals"),
            Ingredient(name="Quinoa", unit="g", category="grains_cereals"),
            Ingredient(name="Oats", unit="g", category="grains_cereals"),
            Ingredient(name="Barley", unit="g", category="grains_cereals"),
            Ingredient(name="Couscous", unit="g", category="grains_cereals"),

            # Legumes & Nuts
            Ingredient(name="Black Beans", unit="g", category="legumes"),
            Ingredient(name="Chickpeas", unit="g", category="legumes"),
            Ingredient(name="Lentils", unit="g", category="legumes"),
            Ingredient(name="Almonds", unit="g", category="legumes"),
            Ingredient(name="Walnuts", unit="g", category="legumes"),
            Ingredient(name="Peanuts", unit="g", category="legumes"),
            Ingredient(name="Cashews", unit="g", category="legumes"),
            Ingredient(name="Pine Nuts", unit="g", category="legumes"),

            # Herbs & Spices
            Ingredient(name="Salt", unit="g", category="herbs_spices"),
            Ingredient(name="Black Pepper", unit="g", category="herbs_spices"),
            Ingredient(name="Basil", unit="g", category="herbs_spices"),
            Ingredient(name="Oregano", unit="g", category="herbs_spices"),
            Ingredient(name="Thyme", unit="g", category="herbs_spices"),
            Ingredient(name="Rosemary", unit="g", category="herbs_spices"),
            Ingredient(name="Paprika", unit="g", category="herbs_spices"),
            Ingredient(name="Cumin", unit="g", category="herbs_spices"),
            Ingredient(name="Garlic Powder", unit="g",
                       category="herbs_spices"),
            Ingredient(name="Onion Powder", unit="g", category="herbs_spices"),
            Ingredient(name="Cinnamon", unit="g", category="herbs_spices"),
            Ingredient(name="Vanilla Extract", unit="ml",
                       category="herbs_spices"),

            # Oils & Fats
            Ingredient(name="Olive Oil", unit="ml", category="oils_fats"),
            Ingredient(name="Vegetable Oil", unit="ml", category="oils_fats"),
            Ingredient(name="Coconut Oil", unit="ml", category="oils_fats"),
            Ingredient(name="Sesame Oil", unit="ml", category="oils_fats"),
            Ingredient(name="Avocado Oil", unit="ml", category="oils_fats"),

            # Condiments & Sauces
            Ingredient(name="Soy Sauce", unit="ml", category="condiments"),
            Ingredient(name="Worcestershire Sauce",
                       unit="ml", category="condiments"),
            Ingredient(name="Hot Sauce", unit="ml", category="condiments"),
            Ingredient(name="Mustard", unit="g", category="condiments"),
            Ingredient(name="Ketchup", unit="g", category="condiments"),
            Ingredient(name="Mayonnaise", unit="g", category="condiments"),
            Ingredient(name="Balsamic Vinegar",
                       unit="ml", category="condiments"),
            Ingredient(name="Apple Cider Vinegar",
                       unit="ml", category="condiments"),
            Ingredient(name="Honey", unit="g", category="condiments"),
            Ingredient(name="Maple Syrup", unit="ml", category="condiments"),

            # Beverages
            Ingredient(name="Water", unit="ml", category="beverages"),
            Ingredient(name="Chicken Broth", unit="ml", category="beverages"),
            Ingredient(name="Vegetable Broth",
                       unit="ml", category="beverages"),
            Ingredient(name="White Wine", unit="ml", category="beverages"),
            Ingredient(name="Red Wine", unit="ml", category="beverages"),
            Ingredient(name="Beer", unit="ml", category="beverages"),

            # Other
            Ingredient(name="Sugar", unit="g", category="other"),
            Ingredient(name="Brown Sugar", unit="g", category="other"),
            Ingredient(name="Baking Powder", unit="g", category="other"),
            Ingredient(name="Baking Soda", unit="g", category="other"),
            Ingredient(name="Yeast", unit="g", category="other"),
            Ingredient(name="Chocolate Chips", unit="g", category="other"),
            Ingredient(name="Cocoa Powder", unit="g", category="other"),
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
                action_type="cook",
                temperature=100,
                speed=0,
                duration=5,
                description="Bring a large pot of salted water to boil."
            ),
            Step(
                recipe_id=pasta_recipe.id,
                order_number=2,
                action_type="cook",
                temperature=100,
                speed=1,
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
                action_type="mix",
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
                action_type="rest",
                temperature=0,
                speed=0,
                duration=5,
                description="Season chicken breasts with salt and pepper."
            ),
            Step(
                recipe_id=chicken_recipe.id,
                order_number=2,
                action_type="fry",
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
                speed=1,
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

        # Helper function to find ingredient by name
        def find_ingredient_by_name(name):
            return next((ing for ing in ingredients if ing.name == name), None)

        pasta_ingredients = [
            RecipeIngredient(
                recipe_id=pasta_recipe.id,
                ingredient_id=find_ingredient_by_name("Pasta").id,
                quantity=400,
                step_id=pasta_steps[1].id
            ),
            RecipeIngredient(
                recipe_id=pasta_recipe.id,
                ingredient_id=find_ingredient_by_name("Eggs").id,
                quantity=4,
                step_id=pasta_steps[2].id
            ),
            RecipeIngredient(
                recipe_id=pasta_recipe.id,
                ingredient_id=find_ingredient_by_name("Parmesan Cheese").id,
                quantity=100,
                step_id=pasta_steps[2].id
            ),
            RecipeIngredient(
                recipe_id=pasta_recipe.id,
                ingredient_id=find_ingredient_by_name("Salt").id,
                quantity=5,
                step_id=pasta_steps[0].id
            ),
            RecipeIngredient(
                recipe_id=pasta_recipe.id,
                ingredient_id=find_ingredient_by_name("Black Pepper").id,
                quantity=2,
                step_id=pasta_steps[3].id
            ),
        ]

        chicken_ingredients = [
            RecipeIngredient(
                recipe_id=chicken_recipe.id,
                ingredient_id=find_ingredient_by_name("Chicken Breast").id,
                quantity=500,
                step_id=chicken_steps[0].id
            ),
            RecipeIngredient(
                recipe_id=chicken_recipe.id,
                ingredient_id=find_ingredient_by_name("Butter").id,
                quantity=50,
                step_id=chicken_steps[1].id
            ),
            RecipeIngredient(
                recipe_id=chicken_recipe.id,
                ingredient_id=find_ingredient_by_name("Garlic").id,
                quantity=3,
                step_id=chicken_steps[2].id
            ),
            RecipeIngredient(
                recipe_id=chicken_recipe.id,
                ingredient_id=find_ingredient_by_name("Salt").id,
                quantity=5,
                step_id=chicken_steps[0].id
            ),
            RecipeIngredient(
                recipe_id=chicken_recipe.id,
                ingredient_id=find_ingredient_by_name("Black Pepper").id,
                quantity=3,
                step_id=chicken_steps[0].id
            ),
        ]

        cookie_ingredients = [
            RecipeIngredient(
                recipe_id=cookie_recipe.id,
                ingredient_id=find_ingredient_by_name("Butter").id,
                quantity=230,
                step_id=cookie_steps[0].id
            ),
            RecipeIngredient(
                recipe_id=cookie_recipe.id,
                ingredient_id=find_ingredient_by_name("Sugar").id,
                quantity=200,
                step_id=cookie_steps[0].id
            ),
            RecipeIngredient(
                recipe_id=cookie_recipe.id,
                ingredient_id=find_ingredient_by_name("Eggs").id,
                quantity=2,
                step_id=cookie_steps[1].id
            ),
            RecipeIngredient(
                recipe_id=cookie_recipe.id,
                ingredient_id=find_ingredient_by_name("Flour").id,
                quantity=350,
                step_id=cookie_steps[2].id
            ),
            RecipeIngredient(
                recipe_id=cookie_recipe.id,
                ingredient_id=find_ingredient_by_name("Vanilla Extract").id,
                quantity=5,
                step_id=cookie_steps[1].id
            ),
            RecipeIngredient(
                recipe_id=cookie_recipe.id,
                ingredient_id=find_ingredient_by_name("Chocolate Chips").id,
                quantity=200,
                step_id=cookie_steps[2].id
            ),
        ]

        all_recipe_ingredients = pasta_ingredients + \
            chicken_ingredients + cookie_ingredients
        session.add_all(all_recipe_ingredients)

        session.commit()
        print("Database seeding completed successfully!")
        print(
            f"Created {len(ingredients)} categorized ingredients across 12 categories")
        print("Created 3 sample recipes with steps and ingredients")

    except Exception as e:
        session.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        session.close()


def print_ingredient_stats():
    """Print statistics about ingredients by category"""
    session = SessionLocal()
    try:
        categories = [
            "vegetables", "fruits", "meat_poultry", "seafood", "dairy",
            "grains_cereals", "legumes", "herbs_spices", "oils_fats",
            "condiments", "beverages", "other"
        ]

        print("\nIngredient Statistics by Category:")
        print("-" * 40)

        for category in categories:
            count = session.query(Ingredient).filter(
                Ingredient.category == category).count()
            print(f"{category.replace('_', ' ').title()}: {count} ingredients")

        total = session.query(Ingredient).count()
        print(f"\nTotal ingredients: {total}")

    finally:
        session.close()


if __name__ == "__main__":
    reset_database()
    seed_database()
    print_ingredient_stats()
