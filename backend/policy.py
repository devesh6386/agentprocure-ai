#remove hallucinations
from schemas import VendorItem
from typing import List,Dict
def evaluate_policy_and_score(options:List[VendorItem],total_budget:float)->List[Dict]:
    evaluated=[]
    for opt in options:
        opt_dict=opt.dict()
        violations=[]
        if opt.price>500:
            violations.append("Exceeds $500 unit limit")
        if opt.delivery_days > 14:
            violations.append("Delivery exceeds 14 days")
        if opt.rating < 3.5:
            violations.append("Vendor rating below 3.5")
            
        opt_dict["is_compliant"] = len(violations) == 0
        opt_dict["compliance_violations"] = ", ".join(violations) if violations else None
        price_score = max(0, 50 * (1 - (opt.price / 500)))
        rating_score = 30 * (opt.rating / 5.0)
        speed_score = max(0, 20 * (1 - (opt.delivery_days / 14)))
        opt_dict["score"] = round(price_score + rating_score + speed_score, 2)
        opt_dict["is_recommended"] = False
        evaluated.append(opt_dict)
    compliant_opts=[o for o in evaluated if o["is_compliant"]]
    if compliant_opts:
        best_option=max(compliant_opts,key=lambda x:x["score"])
        best_option["is_recommended"]=True
    return evaluated