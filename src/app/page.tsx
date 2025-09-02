"use client";

import { useEffect, useState } from "react";
import { Advocate } from "@/db/schema"; 

export default function Home() {
  // update state defs with new type
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      return response.json();
    })
    .then((jsonResponse) => {
      setAdvocates(jsonResponse.data);
      setFilteredAdvocates(jsonResponse.data);
    })
    .catch(err => console.error("Error loading advocates:", err))
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    console.log("filtering advocates...", term);
    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(term) ||
        advocate.lastName.toLowerCase().includes(term) ||
        advocate.city.toLowerCase().includes(term) ||
        advocate.degree.toLowerCase().includes(term) ||
        advocate.specialties.some(s => s.toLowerCase().includes(term)) ||
        advocate.yearsOfExperience.toString().includes(term) // change to string 
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    console.log(advocates);
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term">{searchTerm}</span>
        </p>
        <input style={{ border: "1px solid black" }} onChange={onChange} />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          {/* fix the hydration error where th cannot be a child of thead by adding in a tr */}
          <tr>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">City</th>
            <th scope="col">Degree</th>
            <th scope="col">Specialties</th>
            <th scope="col">Years of Experience</th>
            <th scope="col">Phone Number</th>            
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate, i) => {
            return (
              <tr key={i}>
                <td>{advocate.firstName}</td>
                <td>{advocate.lastName}</td>
                <td>{advocate.city}</td>
                <td>{advocate.degree}</td>
                <td>
                  {advocate.specialties.map((s) => (
                    <div key={s}>{s}</div>
                  ))}
                </td>
                <td>{advocate.yearsOfExperience}</td>
                <td>{advocate.phoneNumber}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
