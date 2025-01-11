from django.conf import settings
from django.test import TestCase

from .handle_stations import get_all_stations, get_stations_analysis
from ..models import Station


class HandleStationsTestCase(TestCase):
    fixtures = ['stations.json', "patients.json", "questions.json", "patient_transfers.json"]

    def test_get_all_stations(self):
        stations = Station.objects.all()
        station_list = get_all_stations()  # This now contains the form [{'id': ..., 'name': ..., 'patientCount': ...}, ...]

        # Extract the names from the station_list array
        station_names_from_function = [station['name'] for station in station_list]

        # Assert that each station's name in the database is present in the function results
        for station in stations:
            self.assertIn(station.name, station_names_from_function,
                          f"Station name '{station.name}' not found in the result of get_all_stations()")

        # Optional: Ensure the lengths match as a final check
        self.assertEqual(len(station_list), stations.count(),
                         "Station count does not match with get_all_stations result")

    def test_get_stations_analysis(self):
        daily_station_workload = get_stations_analysis("daily")
        self.assertEqual(len(daily_station_workload), 0,
                         "Station count with get_stations_analysis daily result should be 0, as no stations have been imported.")
        self.assertEqual(len(daily_station_workload), 0,
                         "Station count with get_stations_analysis monthly result should be 0, as no stations have been imported.")
