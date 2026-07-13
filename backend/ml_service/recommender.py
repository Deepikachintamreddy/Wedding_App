import json
import math
import re
from collections import Counter
from http.server import HTTPServer, BaseHTTPRequestHandler

def tokenize(text):
    if not text:
        return []
    return re.findall(r'\w+', text.lower())

def tf_idf_similarity(text1, text2):
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    
    if not tokens1 or not tokens2:
        return 0.0
        
    cnt1 = Counter(tokens1)
    cnt2 = Counter(tokens2)
    
    all_tokens = set(tokens1).union(set(tokens2))
    dot_product = sum(cnt1[token] * cnt2[token] for token in all_tokens)
    
    norm1 = math.sqrt(sum(val**2 for val in cnt1.values()))
    norm2 = math.sqrt(sum(val**2 for val in cnt2.values()))
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
        
    return dot_product / (norm1 * norm2)

def calculate_match(couple_profile, vendor):
    # 1. Theme Similarity (Cosine similarity)
    couple_theme = couple_profile.get('theme', '')
    vendor_theme = vendor.get('theme', '')
    vendor_desc = vendor.get('description', '')
    
    theme_sim = tf_idf_similarity(couple_theme, vendor_theme)
    desc_sim = tf_idf_similarity(couple_theme, vendor_desc)
    theme_score = max(theme_sim, desc_sim)
    
    # 2. Location Compatibility
    couple_loc = couple_profile.get('location', '').lower()
    vendor_loc = vendor.get('location', '').lower()
    loc_match = 1.0 if (couple_loc in vendor_loc or vendor_loc in couple_loc) else 0.5
    
    # 3. Budget Fit
    target_budget = couple_profile.get('category_budgets', {}).get(vendor.get('category'), 0)
    vendor_price = vendor.get('price', 0)
    
    if target_budget <= 0:
        budget_score = 0.5
    elif vendor_price <= target_budget:
        budget_score = 1.0
    else:
        over_ratio = (vendor_price - target_budget) / target_budget
        budget_score = max(0.0, math.exp(-2.5 * over_ratio))
        
    # 4. Rating Factor
    rating = vendor.get('rating', 4.0)
    rating_score = rating / 5.0
    
    # Weights: Theme 35%, Budget 35%, Location 15%, Rating 15%
    final_score = (theme_score * 0.35) + (budget_score * 0.35) + (loc_match * 0.15) + (rating_score * 0.15)
    
    # Calculate match percentage
    match_percentage = round(final_score * 100, 1)
    
    return {
        'id': vendor.get('id'),
        'name': vendor.get('name'),
        'category': vendor.get('category'),
        'match_score': match_percentage,
        'price': vendor_price,
        'rating': rating,
        'breakdown': {
            'theme_fit': round(theme_score * 100, 1),
            'budget_fit': round(budget_score * 100, 1),
            'location_match': loc_match == 1.0,
            'rating_score': round(rating_score * 100, 1)
        }
    }

def optimize_budget(total_budget, priorities):
    # Reserve 10% safety cushion
    safety_cushion = total_budget * 0.10
    allocatable = total_budget - safety_cushion
    
    # Standard baseline percentages
    baselines = {
        'Venue & Catering': 0.48,
        'Photography & Videography': 0.12,
        'Planner/Coordinator': 0.10,
        'Attire & Beauty': 0.08,
        'Florals & Decor': 0.08,
        'Entertainment': 0.08,
        'Invitations & Rings': 0.06
    }
    
    # Apply priority multipliers
    weights = {}
    for cat, baseline in baselines.items():
        # Priority level is 1 to 5 (default 3)
        rank = priorities.get(cat, 3)
        factor = 1.0 + (rank - 3) * 0.15
        weights[cat] = baseline * factor
        
    # Re-normalize weights
    total_weight = sum(weights.values())
    normalized_weights = {cat: w / total_weight for cat, w in weights.items()}
    
    # Calculate allocations
    allocations = {}
    for cat, weight in normalized_weights.items():
        allocations[cat] = {
            'target': round(allocatable * weight, 2),
            'range_min': round(allocatable * weight * 0.80, 2),
            'range_max': round(allocatable * weight * 1.20, 2)
        }
        
    return {
        'total_budget': total_budget,
        'safety_cushion': round(safety_cushion, 2),
        'allocatable_amount': round(allocatable, 2),
        'allocations': allocations
    }

def generate_vow_speech(role, partner_name, traits, memories, tone):
    # Standardize inputs
    traits_str = ", ".join(traits) if isinstance(traits, list) else traits
    if not traits_str:
        traits_str = "incredible, loving, and beautiful"
    
    memory_section = f"I will never forget when {memories}." if memories else "From the moment we first met, I knew you were the one who would change my life."
    
    if role in ['Groom', 'Bride']:
        # Vow generation
        if tone == 'Romantic':
            text = f"""### 💍 Personalized Wedding Vow (Romantic)

**{partner_name}**, standing here today, I promise to spend the rest of my days showing you how deeply you are loved. 
You are the most {traits_str} person I have ever known. {memory_section}

I vow to listen to you, to hold you through every trial, and to celebrate every joy beside you. 
I promise to choose you, every single day, with all of my heart. 
You are my home, my anchor, and my greatest adventure. I love you, now and forever."""
        elif tone == 'Funny':
            text = f"""### 💍 Personalized Wedding Vow (Funny & Sweet)

**{partner_name}**, they say marriage is about compromise, but standing here with you, it feels like I've won the lottery.
You are {traits_str}, and I promise to love you even when you steal the covers or leave your shoes by the door. {memory_section}

I vow to stand by your side through all of life's adventures, to always pretend to know what direction we are driving in, and to ensure you never have to face the world hungry. 
You are my best friend and my absolute favorite person. Let's make this official!"""
        elif tone == 'Tear-Jerker':
            text = f"""### 💍 Personalized Wedding Vow (Tear-Jerker)

**{partner_name}**, before I met you, I didn't fully understand what it meant to feel completely safe and seen.
Your {traits_str} spirit has healed places in me I didn't know were broken. {memory_section}

I vow to protect this love with everything I have. 
I promise to comfort you in times of doubt, to hold your hand through the quietest evenings and the loudest storms, and to love you more tomorrow than I do today. 
You are my heart's sole choice, my partner, and my lifetime love."""
        else: # Heartfelt / Traditional
            text = f"""### 💍 Personalized Wedding Vow (Heartfelt)

**{partner_name}**, today I take you to be my partner in marriage and in life.
You are {traits_str}, and I am a better person because of you. {memory_section}

I promise to be your companion, your defender, and your biggest fan. 
I vow to encourage your dreams, to share in your laughter, and to build a home filled with warmth, honesty, and grace. 
I give you my hand, my heart, and my love, from this day forward."""
    else:
        # Speech generation for Best Man, Maid of Honor, etc.
        if tone == 'Funny':
            text = f"""### 🎤 Wedding Toast Speech (Funny & Lighthearted)

Hello everyone, for those who don't know me, I'm the {role}. 
I want to start by congratulating this gorgeous couple, **{partner_name}** and their spouse. 
When I first heard about their relationship, I knew it was special. You see, {partner_name} is known for being {traits_str}, so they definitely met their match today!

{memory_section}

Please join me in raising a glass to a lifetime of love, laughter, and tolerating each other's weirdest habits. To the newlyweds!"""
        else:
            text = f"""### 🎤 Wedding Toast Speech (Heartfelt Tribute)

Good evening everyone, I am the {role}, and it is my absolute honor to speak today.
To look at **{partner_name}** and their new partner is to see what true partnership looks like. 
{partner_name}, you have always been {traits_str}, and seeing you find someone who complements and amplifies your beautiful light is a gift to us all.

{memory_section}

May your love grow deeper with every passing year, and may your home always be a place of joy. Let's raise our glasses to the beautiful couple!"""

    return {'text': text}

class MLRequestHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Invalid JSON'}).encode('utf-8'))
            return

        response_data = {}
        
        if self.path == '/api/recommend':
            couple_profile = data.get('couple_profile', {})
            vendors_list = data.get('vendors', [])
            
            recommendations = []
            for vendor in vendors_list:
                match_res = calculate_match(couple_profile, vendor)
                recommendations.append(match_res)
                
            # Sort by match score descending
            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            response_data = {'recommendations': recommendations}
            
        elif self.path == '/api/optimize-budget':
            total_budget = float(data.get('total_budget', 50000))
            priorities = data.get('priorities', {})
            response_data = optimize_budget(total_budget, priorities)
            
        elif self.path == '/api/generate-speech':
            role = data.get('role', 'Groom')
            partner_name = data.get('partner_name', 'Darling')
            traits = data.get('traits', '')
            memories = data.get('memories', '')
            tone = data.get('tone', 'Romantic')
            response_data = generate_vow_speech(role, partner_name, traits, memories, tone)
            
        else:
            self.send_response(404)
            self.end_headers()
            return
            
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MLRequestHandler)
    print(f'Starting Python ML recommendation service on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
