"""Parity tests for accepted artifacts. Not agricultural validation or accuracy measurement."""
import json,hashlib,unittest,os
from pathlib import Path
from main import CalendarFeatures,predict_anomaly,app
from fastapi.testclient import TestClient
baseline=json.loads((Path(__file__).parent.parent/'docs/ML-BASELINE.json').read_text())
class AcceptedInferenceTests(unittest.TestCase):
 def test_artifact_hashes(self):
  for name,value in baseline['hashes'].items():
   self.assertEqual(hashlib.sha256((Path(__file__).parent/'model'/name).read_bytes()).hexdigest(),value)
 def test_exact_inference_parity(self):
  for case in baseline['cases']:
   with self.subTest(input=case['input']): self.assertEqual(predict_anomaly(CalendarFeatures(**case['input'])),case['output'])
 def test_service_transport_and_invalid_input(self):
  os.environ['ML_SERVICE_TOKEN']='test-internal-token'
  with TestClient(app) as client:
   self.assertEqual(client.get('/health').status_code,401)
   headers={'X-Service-Token':'test-internal-token'}
   self.assertTrue(client.get('/health',headers=headers).json()['model_loaded'])
   for case in baseline['cases']: self.assertEqual(client.post('/predict/anomaly',json=case['input'],headers=headers).json(),case['output'])
   self.assertEqual(client.post('/predict/anomaly',json={**baseline['cases'][0]['input'],'planting_doy':0},headers=headers).status_code,422)
   self.assertEqual(client.post('/predict/anomaly',json={**baseline['cases'][0]['input'],'mean_temperature':'NaN'},headers=headers).status_code,422)
if __name__=='__main__': unittest.main(verbosity=2)
