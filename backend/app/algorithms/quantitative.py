import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from collections import defaultdict

def calculate_rule_support(df: pd.DataFrame, condition: Dict[str, Any], decision: Any) -> float:
    """Calculate support for a rule."""
    mask = pd.Series(True, index=df.index)
    for attr, value in condition.items():
        mask &= (df[attr] == value)
    support_count = len(df[mask & (df[df.columns[-1]] == decision)])
    return support_count / len(df)

def calculate_rule_confidence(df: pd.DataFrame, condition: Dict[str, Any], decision: Any) -> float:
    """Calculate confidence for a rule."""
    mask = pd.Series(True, index=df.index)
    for attr, value in condition.items():
        mask &= (df[attr] == value)
    condition_count = len(df[mask])
    if condition_count == 0:
        return 0.0
    support_count = len(df[mask & (df[df.columns[-1]] == decision)])
    return support_count / condition_count

def generate_rules(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Generate all possible rules from the dataset."""
    rules = []
    # Deleting ID and decision columns
    conditional_attrs = df.columns[1:-1]
    decision_attr = df.columns[-1]
    
    # Grouping by conditional attributes
    groups = df.groupby(list(conditional_attrs))
    
    for condition_values, group in groups:
        condition = dict(zip(conditional_attrs, condition_values))
        decisions = group[decision_attr].value_counts()
        
        for decision_value, count in decisions.items():
            # Support - number of objects with this condition and decision / total number of objects
            support = len(group[group[decision_attr] == decision_value]) / len(df)
            
            # Confidence - number of objects with this condition and decision / number of objects with this condition
            confidence = len(group[group[decision_attr] == decision_value]) / len(group)
            
            # Rule weight - product of support and confidence
            weight = support * confidence
            
            rules.append({
                "condition": condition,
                "decision": decision_value,
                "support": support,
                "confidence": confidence,
                "weight": weight
            })
    
    return rules

def calculate_object_weight(row: pd.Series, rules: List[Dict[str, Any]], decision_attr: str) -> float:
    """Calculate weight for an object based on matching rules."""
    total_weight = 0.0
    matching_rules = 0
    
    for rule in rules:
        matches = True
        for attr, value in rule["condition"].items():
            if str(row[attr]) != str(value):
                matches = False
                break
        
        if matches and str(row[decision_attr]) == str(rule["decision"]):
            weight = rule["weight"]
            total_weight += weight
            matching_rules += 1
    
    return total_weight / matching_rules if matching_rules > 0 else 0.0

def process_quantitative(df: pd.DataFrame) -> Dict[str, Any]:
    """Process data using quantitative method."""
    try:
        steps = []
        decision_attr = df.columns[-1]
        
        # Step 1: Original data
        original_data = df.astype(str).to_dict()
        steps.append({
            "step": 1,
            "description": "Dane oryginalne",
            "data": original_data
        })
        
        # Step 2: Generate rules
        rules = generate_rules(df)
        
        # Calculate decision frequencies
        decision_frequencies = df[decision_attr].value_counts()
        
        # Convert rules to serializable format
        serializable_rules = []
        for rule in rules:
            serializable_rule = {
                "condition": {str(k): str(v) for k, v in rule["condition"].items()},
                "decision": str(rule["decision"]),
                "support": float(rule["support"]),
                "confidence": float(rule["confidence"]),
                "weight": float(rule["weight"]),
                "decision_frequency": int(decision_frequencies[rule["decision"]])
            }
            serializable_rules.append(serializable_rule)
            
        steps.append({
            "step": 2,
            "description": "Wygenerowane reguły",
            "rules": serializable_rules
        })
        
        # Step 3: Group rules by conditions
        condition_groups = {}
        for rule in serializable_rules:
            # Creating a key from the values of conditional attributes
            condition_items = sorted((k, v) for k, v in rule["condition"].items() if k != 'Pacjent')
            condition_key = str(condition_items)
            if condition_key not in condition_groups:
                condition_groups[condition_key] = []
            condition_groups[condition_key].append(rule)
        
        # Find rules with lowest weights for each condition group
        objects_to_remove = []
        for idx, row in df.iterrows():
            # Creating a key from the values of conditional attributes for the current object
            condition_items = sorted((k, str(v)) for k, v in row.items() if k != decision_attr and k != 'Pacjent')
            row_condition = str(condition_items)
            
            if row_condition in condition_groups:
                rules_for_condition = condition_groups[row_condition]
                if len(rules_for_condition) > 1:  # If there are several rules for these conditions
                    # Finding the minimum weight among the rules
                    min_weight = min(r["weight"] for r in rules_for_condition)
                    # Finding rules with the minimum weight
                    min_weight_rules = [r for r in rules_for_condition if r["weight"] == min_weight]
                    
                    if len(min_weight_rules) > 1:
                        # If there are several rules with the minimum weight,
                        # we select the rule with the least frequent decision
                        min_freq_rule = min(min_weight_rules, key=lambda r: r["decision_frequency"])
                        if str(row[decision_attr]) == min_freq_rule["decision"]:
                            objects_to_remove.append(str(idx))
                    else:
                        # If there is only one rule with the minimum weight
                        if str(row[decision_attr]) == min_weight_rules[0]["decision"]:
                            objects_to_remove.append(str(idx))
        
        steps.append({
            "step": 3,
            "description": "Obiekty do usunięcia",
            "objects": objects_to_remove
        })
        
        # Step 4: Create new consistent dataset
        consistent_df = df.drop([int(obj) for obj in objects_to_remove])
        consistent_data = consistent_df.astype(str).to_dict()
        
        steps.append({
            "step": 4,
            "description": "Spójny zbiór danych",
            "data": consistent_data
        })
        
        return {
            "steps": steps,
            "result": {
                "consistent_data": consistent_data,
                "removed_objects": objects_to_remove,
                "rules": serializable_rules,
                "summary": {
                    "original_size": len(df),
                    "consistent_size": len(consistent_df),
                    "removed_count": len(objects_to_remove),
                    "rules_count": len(serializable_rules)
                }
            }
        }
    except Exception as e:
        print(f"Error in process_quantitative: {str(e)}")
        raise 