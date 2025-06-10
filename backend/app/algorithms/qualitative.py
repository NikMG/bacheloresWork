import pandas as pd
from typing import Dict, List, Any, Tuple

def calculate_abstraction_classes(df: pd.DataFrame) -> Dict[str, List[str]]:
    """Calculate abstraction classes based on conditional attributes."""
    classes = {}
    # Исключаем столбец с ID пациента и столбец решения
    conditional_attrs = df.columns[1:-1]  
    
    for idx, row in df.iterrows():
        # Создаем ключ из значений условных атрибутов
        key = tuple(str(row[attr]).strip() for attr in conditional_attrs)
        if key not in classes:
            classes[key] = []
        classes[key].append(str(idx))
    return classes

def calculate_lower_approximation(df: pd.DataFrame, classes: Dict[str, List[str]], decision_value: Any) -> List[str]:
    """Calculate lower approximation for given decision value."""
    lower_approx = []
    decision_value = str(decision_value).strip()
    print(f"Calculating lower approximation for decision value: {decision_value}")
    
    for key, objects in classes.items():
        # Проверяем, все ли объекты в классе имеют одинаковое решение
        class_decisions = [str(df.loc[int(obj), df.columns[-1]]).strip() for obj in objects]
        print(f"Class {key} decisions: {class_decisions}")
        
        if all(dec == decision_value for dec in class_decisions):
            print(f"Adding objects {objects} to lower approximation")
            lower_approx.extend(objects)
    
    print(f"Final lower approximation: {lower_approx}")
    return lower_approx

def calculate_upper_approximation(df: pd.DataFrame, classes: Dict[str, List[str]], decision_value: Any) -> List[str]:
    """Calculate upper approximation for given decision value."""
    upper_approx = []
    decision_value = str(decision_value).strip()
    print(f"Calculating upper approximation for decision value: {decision_value}")
    
    for key, objects in classes.items():
        # Проверяем, есть ли хотя бы один объект с данным решением
        class_decisions = [str(df.loc[int(obj), df.columns[-1]]).strip() for obj in objects]
        print(f"Class {key} decisions: {class_decisions}")
        
        if any(dec == decision_value for dec in class_decisions):
            print(f"Adding objects {objects} to upper approximation")
            upper_approx.extend(objects)
    
    print(f"Final upper approximation: {upper_approx}")
    return upper_approx

def calculate_accuracy(lower_approx: List[str], upper_approx: List[str]) -> float:
    """Calculate accuracy of approximation."""
    if not upper_approx:
        print("Upper approximation is empty, returning 0.0")
        return 0.0
    accuracy = len(lower_approx) / len(upper_approx)
    print(f"Calculated accuracy: {accuracy} (lower: {len(lower_approx)}, upper: {len(upper_approx)})")
    return accuracy

def process_qualitative(df: pd.DataFrame) -> Dict[str, Any]:
    """Process data using qualitative method."""
    steps = []
    
    # Step 1: Original data
    steps.append({
        "step": 1,
        "description": "Dane oryginalne",
        "data": df.to_dict()
    })
    
    # Step 2: Calculate abstraction classes and their frequencies
    classes = calculate_abstraction_classes(df)
    class_frequencies = {}
    for key, objects in classes.items():
        decisions = df.loc[[int(obj) for obj in objects], df.columns[-1]].value_counts()
        class_frequencies[key] = decisions.to_dict()
    
    # Convert tuple keys to strings for JSON serialization
    serializable_classes = {str(k): v for k, v in classes.items()}
    steps.append({
        "step": 2,
        "description": "Klasy abstrakcji z częstotliwościami",
        "classes": serializable_classes,
        "frequencies": {str(k): v for k, v in class_frequencies.items()}
    })
    
    # Step 3-5: Calculate approximations for each decision value
    decision_values = df[df.columns[-1]].unique()
    approximations = {}
    
    for value in decision_values:
        dolne = calculate_lower_approximation(df, classes, value)
        gorne = calculate_upper_approximation(df, classes, value)
        dokladnosc = calculate_accuracy(dolne, gorne)
        
        approximations[str(value)] = {
            "dolne": dolne,
            "gorne": gorne,
            "dokladnosc": dokladnosc
        }
    
    steps.append({
        "step": 3,
        "description": "Aproksymacje",
        "approximations": approximations
    })
    
    # Step 6: Identify and remove inconsistent objects
    inconsistent_objects = []
    for key, objects in classes.items():
        decisions = df.loc[[int(obj) for obj in objects], df.columns[-1]].value_counts()
        if len(decisions) > 1:
            # Keep objects with the most frequent decision in the class
            most_frequent_decision = decisions.index[0]
            for obj in objects:
                obj_decision = df.loc[int(obj), df.columns[-1]]
                if obj_decision != most_frequent_decision:
                    inconsistent_objects.append(obj)
    
    steps.append({
        "step": 4,
        "description": "Obiekty niespójne",
        "objects": inconsistent_objects
    })
    
    # Step 7: Create new consistent dataset
    consistent_df = df.drop([int(obj) for obj in inconsistent_objects])
    steps.append({
        "step": 5,
        "description": "Spójny zbiór danych",
        "data": consistent_df.to_dict()
    })
    
    return {
        "steps": steps,
        "result": {
            "consistent_data": consistent_df.to_dict(),
            "removed_objects": inconsistent_objects,
            "approximations": approximations,
            "summary": {
                "original_size": len(df),
                "consistent_size": len(consistent_df),
                "removed_count": len(inconsistent_objects)
            }
        }
    } 