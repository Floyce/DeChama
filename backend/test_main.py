import sys
sys.modules['_wmi'] = None
try:
    import app.main
    print('Success')
except Exception as e:
    print('Error:', e)
