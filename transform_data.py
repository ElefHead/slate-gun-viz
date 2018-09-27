import pandas as pd 
from os import path
import json
from math import isnan
from dateutil import parser

STATE_NAME = {
	'AL': 'Alabama', 'AK': "Alaska", 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida',
	'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
	'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
	'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
	'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 
	'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'AS': 'American Samoa', 'DC': 'District of Columbia',
	'FM': 'Federated States of Micronesia', 'GU': 'Guam', 'MH': 'Marshall Islands', 'MP': 'Northern Mariana Islands', 'PW': 'Palau', 'PR': 'Puerto Rico', 'VI': 'Virgin Islands'
}


def read_csv(loc='', filename=''):
	csv_filepath = path.join(loc, filename)
	return pd.read_csv(csv_filepath, encoding='ISO-8859-1')


def read_json(loc='', filename=''):
	json_filepath = path.join(loc, filename)
	with open(json_filepath, 'r') as jf:
		data = json.load(jf)
	return data 


def write_json(data, loc='', filename='', indent=2):
	json_filepath = path.join(loc, filename)
	with open(json_filepath, 'w') as jd:
		json.dump(data, jd, indent=indent)


def get_state_counts(data):
	state_counts = dict()
	for i in range(data.shape[0]):
		code = data['state'][i].upper()
		state_name = get_state_name(code)
		gender = data['gender'][i]
		ageGroup = str(data['ageGroup'][i])
		
		city = data['city'][i].strip()

		if state_name in state_counts :
			state_counts[state_name]['count'] += 1
		else :
			state_counts[state_name] = {
				'code': code,
				'count': 1,
				'genderMale': 0,
				'genderFemale': 0,
				'genderUnknown': 0,
				'ageGroup1': 0,
				'ageGroup2': 0,
				'ageGroup3': 0,
				'ageGroupUnknown': 0,
				'cities': {},
			}

		if type(gender) != type(1.0):
			if gender.lower() == 'm':
				state_counts[state_name]['genderMale'] += 1
			elif gender.lower() == 'f':
				state_counts[state_name]['genderFemale'] += 1
			else:
				state_counts[state_name]['genderUnknown'] += 1
		else:
			state_counts[state_name]['genderUnknown'] += 1

		if ageGroup == '1.0':
			state_counts[state_name]['ageGroup1'] += 1
		elif ageGroup == '2.0':
			state_counts[state_name]['ageGroup2'] += 1
		elif ageGroup == '3.0':
			state_counts[state_name]['ageGroup3'] += 1
		else:
			state_counts[state_name]['ageGroupUnknown'] += 1

		if city in state_counts[state_name]['cities']:
			state_counts[state_name]['cities'][city] += 1
		else:
			state_counts[state_name]['cities'][city] = 1

	return state_counts


def get_city_counts(data):
	city_counts = dict()

	for i in range(data.shape[0]):

		state_name = get_state_name(data['state'][i].upper())
		gender = data['gender'][i]
		ageGroup = str(data['ageGroup'][i])
		lat = str(data['lat'][i])
		lon = str(data['lng'][i])

		city = data['city'][i].strip()

		if state_name not in city_counts:
			city_counts[state_name] = {}

		state = city_counts[state_name]

		if city in state:
			state[city]['count'] += 1
		else:
			state[city] = {
				'count': 1,
				'lat': lat,
				'lon': lon,
				'ageGroup1': 0,
				'ageGroup2': 0,
				'ageGroup3': 0,
				'ageGroupUnknown': 0,
				'genderMale': 0,
				'genderFemale': 0,
				'genderMale': 0,
				'genderUnknown': 0,
			}

		if type(gender) != type(1.0):
			if gender.lower() == 'm':
				state[city]['genderMale'] += 1
			elif gender.lower() == 'f':
				state[city]['genderFemale'] += 1
			else:
				state[city]['genderUnknown'] += 1
		else:
			state[city]['genderUnknown'] += 1

		if ageGroup == '1.0':
			state[city]['ageGroup1'] += 1
		elif ageGroup == '2.0':
			state[city]['ageGroup2'] += 1
		elif ageGroup == '3.0':
			state[city]['ageGroup3'] += 1
		else:
			state[city]['ageGroupUnknown'] += 1

		city_counts[state_name] = state

	return city_counts


def get_city_victims(data):
	city_victims = dict()

	for i in range(data.shape[0]):
		state_name = get_state_name(data['state'][i].upper())

		city = data['city'][i].strip()
		victimID = data['victimID'][i]
		name = data['name'][i]
		age = data['age'][i]
		url = data['url'][i]
		ageGroup = data['ageGroup'][i]
		date = parser.parse(data['date'][i])
		gender = data['gender'][i]

		if state_name in city_victims:
			state = city_victims[state_name]
		else:
			state = {}

		if city in state:
			state[city]['count'] += 1
		else:
			state[city] = {
				'count': 1,
				'victims': []
			}

		victim = {
			'_id': str(victimID),
			'url': url,
			'name': name if type(name) != type(1.0) else 'Unknown',
			'age': str(int(age)) if not isnan(age) else 'Unknown',
			'ageGroup': str(int(ageGroup)) if not isnan(ageGroup) else 'Unknown',
			'date': date.strftime('%d %b %Y'),
			'gender': str(gender) if type(gender) is not type(1.0) else 'Unknown',
			'city': city,
			'state': state_name
		}

		state[city]['victims'].append(victim)

		city_victims[state_name] = state

	return city_victims

def get_victims_list(data):
	victims = {}

	counts = {
		'M': {
			'1.0':0,
			'2.0':0,
			'3.0':0,
			'total': 0,
		},
		'F': {
			'1.0':0,
			'2.0':0,
			'3.0':0,
			'total': 0
		}
	}

	for i in range(data.shape[0]):
		state_name = get_state_name(data['state'][i].upper())

		city = data['city'][i].strip()
		victimID = data['victimID'][i]
		name = data['name'][i]
		age = data['age'][i]
		url = data['url'][i]
		ageGroup = data['ageGroup'][i]
		date = parser.parse(data['date'][i])
		gender = data['gender'][i]

		victims[str(victimID)] = {
			'url': url,
			'name': name if type(name) != type(1.0) else 'Unknown',
			'age': str(int(age)) if not isnan(age) else 'Unknown',
			'ageGroup': str(int(ageGroup)) if not isnan(ageGroup) else 'Unknown',
			'date': date.strftime('%d %b %Y'),
			'state': state_name,
			'city': city,
			'gender': str(gender) if type(gender) is not type(1.0) else 'Unknown'
		}

		if str(gender) in counts:
			counts[gender]['total']+=1
			if str(ageGroup) in counts[gender]:
				counts[str(gender)][str(ageGroup)] += 1

	print(counts)

	return victims


def get_state_name(name):
	return STATE_NAME[name]

if __name__ == '__main__':
	slate_gun_deaths = read_csv(loc='data', filename='SlateGunDeaths.csv')
	# state_json = read_json(loc='data', filename='us-states.topojson')

	print(slate_gun_deaths.shape)
	# print(state_json['objects']['collection']['geometries'][:5])

	state_counts = get_state_counts(slate_gun_deaths)
	city_counts = get_city_counts(slate_gun_deaths)
	city_victims = get_city_victims(slate_gun_deaths)
	victims = get_victims_list(slate_gun_deaths)
	write_json(state_counts, loc='data', filename='stateCounts.json')
	write_json(city_counts, loc='data', filename='cityCounts.json')
	write_json(city_victims, loc='data', filename='cityVictims.json')
	write_json(victims, loc='data', filename='victimsList.json')
