import pandas as pd

# Read the CSV file into a Pandas DataFrame
df = pd.read_csv('cleaned_5250.csv')

# Identify planets with the same distance and discovery year
duplicated_rows = df[df.duplicated(subset=['distance', 'discovery_year'], keep=False)]

# Drop duplicate rows except for the first occurrence
df.drop_duplicates(subset=['distance', 'discovery_year'], keep='first', inplace=True)

# Export the updated DataFrame as a new CSV file
df.to_csv('updated_planets.csv', index=False)

# Print a message indicating that the export was successful
print('The updated DataFrame has been exported to updated_planets.csv.')
