import pandas as pd

df = pd.read_excel(r'c:\Users\Administrator\Desktop\Modestus\shop_inventory-main\Inventory list with highlighting1.xlsx')

print('COLUMNS:')
print(df.columns.tolist())
print('\n---')

for col in df.columns:
    try:
        unique_vals = df[col].dropna().astype(str).unique().tolist()
        print(f'{col}: {unique_vals[:40]}')
    except Exception as e:
        print(f'{col}: Error - {e}')
