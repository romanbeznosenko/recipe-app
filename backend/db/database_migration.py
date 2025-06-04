"""
Database migration script to add category column to ingredients table
and update existing ingredients with categories
"""
from sqlalchemy import text
from db.base import engine, SessionLocal


def migrate_ingredient_categories():
    """
    Add category column to ingredients table and categorize existing ingredients
    """

    try:
        print("Starting ingredient category migration...")

        # Add category column if it doesn't exist
        print("Adding category column to ingredients table...")
        with engine.connect() as connection:
            try:
                connection.execute(text(
                    "ALTER TABLE ingredients ADD COLUMN category VARCHAR(63) NOT NULL DEFAULT 'other'"
                ))
                connection.commit()
                print("Category column added successfully!")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("Category column already exists, skipping...")
                else:
                    raise e

        # Update existing ingredients with appropriate categories using raw SQL
        print("Categorizing existing ingredients...")

        # Define ingredient mappings (name pattern -> category)
        ingredient_categories = {
            # Vegetables
            "onion": "vegetables",
            "garlic": "vegetables",
            "tomato": "vegetables",
            "carrot": "vegetables",
            "potato": "vegetables",
            "bell pepper": "vegetables",
            "pepper": "vegetables",
            "mushroom": "vegetables",
            "spinach": "vegetables",
            "broccoli": "vegetables",
            "zucchini": "vegetables",
            "cucumber": "vegetables",
            "lettuce": "vegetables",

            # Fruits
            "apple": "fruits",
            "lemon": "fruits",
            "orange": "fruits",
            "banana": "fruits",
            "lime": "fruits",
            "berry": "fruits",
            "grape": "fruits",

            # Meat & Poultry
            "chicken": "meat_poultry",
            "beef": "meat_poultry",
            "pork": "meat_poultry",
            "turkey": "meat_poultry",
            "lamb": "meat_poultry",
            "duck": "meat_poultry",
            "meat": "meat_poultry",

            # Seafood
            "salmon": "seafood",
            "tuna": "seafood",
            "shrimp": "seafood",
            "cod": "seafood",
            "fish": "seafood",
            "crab": "seafood",
            "lobster": "seafood",

            # Dairy & Eggs
            "milk": "dairy",
            "butter": "dairy",
            "cheese": "dairy",
            "cream": "dairy",
            "yogurt": "dairy",
            "egg": "dairy",
            "mozzarella": "dairy",
            "parmesan": "dairy",
            "cheddar": "dairy",

            # Grains & Cereals
            "pasta": "grains_cereals",
            "spaghetti": "grains_cereals",
            "rice": "grains_cereals",
            "flour": "grains_cereals",
            "bread": "grains_cereals",
            "oats": "grains_cereals",
            "quinoa": "grains_cereals",
            "barley": "grains_cereals",
            "wheat": "grains_cereals",

            # Legumes & Nuts
            "bean": "legumes",
            "lentil": "legumes",
            "chickpea": "legumes",
            "almond": "legumes",
            "walnut": "legumes",
            "peanut": "legumes",
            "cashew": "legumes",
            "pistachio": "legumes",

            # Herbs & Spices
            "basil": "herbs_spices",
            "oregano": "herbs_spices",
            "thyme": "herbs_spices",
            "rosemary": "herbs_spices",
            "parsley": "herbs_spices",
            "salt": "herbs_spices",
            "pepper": "herbs_spices",
            "paprika": "herbs_spices",
            "cumin": "herbs_spices",
            "cinnamon": "herbs_spices",
            "ginger": "herbs_spices",
            "turmeric": "herbs_spices",

            # Oils & Fats
            "oil": "oils_fats",
            "olive oil": "oils_fats",
            "coconut oil": "oils_fats",
            "vegetable oil": "oils_fats",
            "canola oil": "oils_fats",
            "avocado oil": "oils_fats",

            # Condiments & Sauces
            "vinegar": "condiments",
            "soy sauce": "condiments",
            "honey": "condiments",
            "mustard": "condiments",
            "ketchup": "condiments",
            "mayonnaise": "condiments",
            "sauce": "condiments",

            # Beverages
            "water": "beverages",
            "wine": "beverages",
            "stock": "beverages",
            "broth": "beverages",
            "juice": "beverages",
            "beer": "beverages",

            # Other/Baking
            "sugar": "other",
            "brown sugar": "other",
            "baking powder": "other",
            "baking soda": "other",
            "vanilla": "other",
            "cocoa": "other",
            "chocolate": "other",
            "yeast": "other",
        }

        with engine.connect() as connection:
            # Get all ingredients
            result = connection.execute(
                text("SELECT id, name FROM ingredients"))
            ingredients = result.fetchall()

            updated_count = 0
            for ingredient in ingredients:
                ingredient_id = ingredient[0]
                ingredient_name = ingredient[1].lower()

                # Find matching category
                matched_category = "other"  # default
                for name_pattern, category in ingredient_categories.items():
                    if name_pattern in ingredient_name:
                        matched_category = category
                        break

                # Update the ingredient with the category
                connection.execute(text(
                    "UPDATE ingredients SET category = :category WHERE id = :id"
                ), {"category": matched_category, "id": ingredient_id})

                updated_count += 1
                print(
                    f"  Categorized '{ingredient[1]}' as '{matched_category}'")

            connection.commit()
            print(f"Successfully categorized {updated_count} ingredients")

        # Add sample ingredients with categories if database has few ingredients
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT COUNT(*) FROM ingredients"))
            ingredient_count = result.scalar()

            if ingredient_count < 15:
                print("Adding sample categorized ingredients...")
                sample_ingredients = [
                    # Vegetables
                    ("Red onion", "piece", "vegetables"),
                    ("Fresh garlic", "clove", "vegetables"),
                    ("Cherry tomatoes", "g", "vegetables"),
                    ("Bell pepper", "piece", "vegetables"),

                    # Fruits
                    ("Fresh lemon", "piece", "fruits"),
                    ("Lime", "piece", "fruits"),

                    # Meat & Poultry
                    ("Chicken thighs", "g", "meat_poultry"),
                    ("Ground beef", "g", "meat_poultry"),

                    # Seafood
                    ("Fresh salmon", "g", "seafood"),
                    ("Shrimp", "g", "seafood"),

                    # Dairy
                    ("Heavy cream", "ml", "dairy"),
                    ("Fresh mozzarella", "g", "dairy"),
                    ("Greek yogurt", "g", "dairy"),

                    # Grains
                    ("Arborio rice", "g", "grains_cereals"),
                    ("Whole wheat flour", "g", "grains_cereals"),
                    ("Quinoa", "g", "grains_cereals"),

                    # Herbs & Spices
                    ("Fresh basil", "g", "herbs_spices"),
                    ("Dried oregano", "tsp", "herbs_spices"),
                    ("Sea salt", "tsp", "herbs_spices"),
                    ("Ground black pepper", "tsp", "herbs_spices"),
                    ("Fresh ginger", "g", "herbs_spices"),

                    # Oils & Fats
                    ("Extra virgin olive oil", "ml", "oils_fats"),
                    ("Coconut oil", "ml", "oils_fats"),

                    # Condiments
                    ("Balsamic vinegar", "ml", "condiments"),
                    ("Dijon mustard", "tsp", "condiments"),
                    ("Soy sauce", "ml", "condiments"),

                    # Beverages
                    ("Chicken stock", "ml", "beverages"),
                    ("White wine", "ml", "beverages"),
                    ("Vegetable broth", "ml", "beverages"),

                    # Other
                    ("Brown sugar", "g", "other"),
                    ("Vanilla extract", "tsp", "other"),
                    ("Baking powder", "tsp", "other"),
                ]

                added_count = 0
                for name, unit, category in sample_ingredients:
                    # Check if ingredient already exists
                    result = connection.execute(text(
                        "SELECT COUNT(*) FROM ingredients WHERE LOWER(name) = LOWER(:name)"
                    ), {"name": name})

                    if result.scalar() == 0:
                        connection.execute(text(
                            "INSERT INTO ingredients (name, unit, category, created_at, updated_at) VALUES (:name, :unit, :category, NOW(), NOW())"
                        ), {"name": name, "unit": unit, "category": category})
                        added_count += 1
                        print(
                            f"  Added sample ingredient: {name} ({category})")

                connection.commit()
                print(f"Added {added_count} sample ingredients successfully!")

        print("Ingredient category migration completed successfully!")

    except Exception as e:
        print(f"Error during migration: {e}")
        raise


if __name__ == "__main__":
    migrate_ingredient_categories()
