require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "fateh123",
    database: "BookMySpace",
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: " + err.message);
    } else {
        console.log("Connected to MySQL Database");
    }
});

app.post("/signup", (req, res) => {
  const { full_name, email, phone_number, team_name, sport, password } = req.body;

  if (!full_name || !email || !phone_number || !team_name || !sport || !password) {
      return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO Captains (full_name, email, phone_number, team_name, sport, password) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [full_name, email, phone_number, team_name, sport, password], (err, result) => {
      if (err) {
          if (err.code === "ER_DUP_ENTRY") {
              return res.status(400).json({ message: "Email or phone number already exists" });
          }
          return res.status(500).json({ message: "Database error", error: err });
      }
      
      const teamSql = "INSERT INTO teams (team_name, captain_email, sport, location, rating, matches_played, wins) VALUES (?, ?, ?, 'Karachi', 0, 0, 0)";
      db.query(teamSql, [team_name, email, sport], (teamErr) => {
          if (teamErr) {
              console.error("Error creating team:", teamErr);
          }
          res.status(201).json({ message: "User registered successfully" });
      });
  });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const query = "SELECT full_name, email, password FROM Captains WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = results[0];

        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                full_name: user.full_name, 
                email: user.email
            }
        });
    });
});


app.get("/grounds", (req, res) => {
    const sql = "SELECT * FROM grounds";
    db.query(sql, (err, result) => {
      if (err) {
        res.status(500).send("Error fetching data");
      } else {
        res.json(result);
      }
    });
  });

  app.get("/teams", (req, res) => {
    const sql = "SELECT * FROM teams";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching teams:", err);
        res.status(500).json({ message: "Server error" });
      } else {
        res.json(results);
      }
    });
  });



  app.post("/api/bookings", (req, res) => {
    console.log("Received booking request:", req.body); 
    
    const { captain_email, ground_id, booking_date, start_time, end_time, sport, status } = req.body;
  
    if (!captain_email || !ground_id || !booking_date || !start_time || !end_time || !sport) {
      console.log("Validation failed - missing fields:", {
        captain_email: !!captain_email,
        ground_id: !!ground_id,
        booking_date: !!booking_date,
        start_time: !!start_time,
        end_time: !!end_time,
        sport: !!sport
      });
      return res.status(400).json({ 
        success: false,
        message: "All fields are required",
        requiredFields: {
          captain_email: "string",
          ground_id: "number",
          booking_date: "YYYY-MM-DD",
          start_time: "HH:MM:SS",
          end_time: "HH:MM:SS",
          sport: "string"
        }
      });
    }
  
    const checkSql = `
      SELECT id FROM bookings 
      WHERE ground_id = ? 
      AND booking_date = ? 
      AND (
        (start_time < ? AND end_time > ?) OR 
        (start_time < ? AND end_time > ?) OR 
        (start_time >= ? AND end_time <= ?)
      )
      AND status != 'Cancelled'
    `;
    
    db.query(checkSql, [
      ground_id, 
      booking_date,
      end_time, start_time,
      end_time, start_time,
      start_time, end_time
    ], (err, results) => {
      if (err) {
        console.error("Database check error:", err);
        return res.status(500).json({ 
          success: false,
          message: "Database error",
          error: err.message 
        });
      }
  
      if (results.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Time slot already booked" 
        });
      }
  
      const insertSql = `
        INSERT INTO bookings 
        (captain_email, ground_id, booking_date, start_time, end_time, sport, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.query(insertSql, [
        captain_email,
        ground_id,
        booking_date,
        start_time,
        end_time,
        sport,
        'Confirmed'
      ], (err, result) => {
        if (err) {
          console.error("Database insert error:", err);
          return res.status(500).json({ 
            success: false,
            message: "Database error",
            error: {
              code: err.code,
              sqlMessage: err.sqlMessage,
              sql: err.sql
            } 
          });
        }
        
        console.log("Booking created successfully with ID:", result.insertId);
        res.status(201).json({ 
          success: true,
          message: "Booking created successfully",
          bookingId: result.insertId 
        });
      });
    });
  });

app.get("/api/bookings/ground/:groundId/:date", (req, res) => {
    const { groundId, date } = req.params;
  
    if (!groundId || !date) {
      return res.status(400).json({ message: "Ground ID and date are required" });
    }
  
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }
  
    const sql = `
      SELECT start_time, end_time 
      FROM bookings 
      WHERE ground_id = ? 
      AND booking_date = ? 
      AND status != 'Cancelled'
    `;
  
    db.query(sql, [groundId, date], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          message: "Database error",
          error: err.message 
        });
      }
  
      res.json(results);
    });
  });

app.get("/api/bookings/upcoming/:email", (req, res) => {
    const { email } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const sql = `
        SELECT b.*, g.name as ground_name 
        FROM bookings b
        LEFT JOIN grounds g ON b.ground_id = g.id
        WHERE b.captain_email = ? 
        AND b.booking_date >= ?
        AND b.status != 'Cancelled'
        ORDER BY b.booking_date ASC, b.start_time ASC
    `;

    db.query(sql, [email, today], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ 
                message: "Database error",
                error: err.message 
            });
        }
        res.json(results);
    });
});

app.get("/captain/:email", (req, res) => {
    const { email } = req.params;
    
    const sql = "SELECT * FROM Captains WHERE email = ?";
    db.query(sql, [email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Captain not found" });
      }
      res.json(result[0]);
    });
  });
  
  app.put("/captain/:email", (req, res) => {
    const { email } = req.params;
    const { full_name, phone_number } = req.body;
    
    const sql = "UPDATE Captains SET full_name = ?, phone_number = ? WHERE email = ?";
    db.query(sql, [full_name, phone_number, email], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json({ success: true, message: "Profile updated" });
    });
  });
  
  app.get("/team/:team_name", (req, res) => {
    const { team_name } = req.params;
    
    const sql = "SELECT * FROM teams WHERE team_name = ?";
    db.query(sql, [team_name], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(result[0]);
    });
  });


app.post("/team", (req, res) => {
  const { team_name, captain_email, sport } = req.body;
  
  if (!team_name || !captain_email || !sport) {
      return res.status(400).json({ message: "Team name, captain email and sport are required" });
  }
  
  const sql = "INSERT INTO teams (team_name, captain_email, sport, location, rating, matches_played, wins) VALUES (?, ?, ?, 'Karachi', 0, 0, 0)";
  db.query(sql, [team_name, captain_email, sport], (err, result) => {
      if (err) {
          if (err.code === "ER_DUP_ENTRY") {
              return res.status(400).json({ message: "Team name already exists" });
          }
          return res.status(500).json({ message: "Database error", error: err });
      }
      res.json({ success: true, message: "Team created successfully" });
  });
});

app.put("/team/:team_name", (req, res) => {
  const { team_name } = req.params;
  const { sport } = req.body;
  
  if (!sport) {
      return res.status(400).json({ message: "Sport is required" });
  }
  
  const sql = "UPDATE teams SET sport = ? WHERE team_name = ?";
  db.query(sql, [sport, team_name], (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Team not found" });
      }
      res.json({ success: true, message: "Team sport updated" });
  });
});

app.post("/team-members", (req, res) => {
  const { team_name, member_name } = req.body;
  
  if (!team_name || !member_name) {
      return res.status(400).json({ message: "Team name and member name are required" });
  }
  
  db.query("SELECT 1 FROM teams WHERE team_name = ?", [team_name], (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: "Team not found" });
      }
      
      const sql = "INSERT INTO team_members (team_name, member_name) VALUES (?, ?)";
      db.query(sql, [team_name, member_name], (err, result) => {
          if (err) {
              return res.status(500).json({ message: "Database error", error: err });
          }
          res.json({ 
              success: true, 
              message: "Member added",
              member: { id: result.insertId, team_name, member_name }
          });
      });
  });
});
  
  app.get("/team-members/:team_name", (req, res) => {
    const { team_name } = req.params;
    
    const sql = "SELECT * FROM team_members WHERE team_name = ?";
    db.query(sql, [team_name], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(result);
    });
  });
  
  app.post("/team-members", (req, res) => {
    const { team_name, member_name } = req.body;
    
    const sql = "INSERT INTO team_members (team_name, member_name) VALUES (?, ?)";
    db.query(sql, [team_name, member_name], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json({ success: true, message: "Member added" });
    });
  });

app.get("/captains", (req, res) => {
  const sql = "SELECT full_name, email, phone_number, team_name, sport FROM Captains";
  db.query(sql, (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(result);
  });
});

app.post("/api/challenges", (req, res) => {
  console.log("Received challenge request:", req.body);
  
  const { challenger_email, opponent_email, ground_id, challenge_date, start_time, end_time, sport } = req.body;

  if (!challenger_email || !opponent_email || !ground_id || !challenge_date || !start_time || !end_time || !sport) {
      return res.status(400).json({ 
          success: false,
          message: "All fields are required"
      });
  }

  db.query("SELECT 1 FROM Captains WHERE email = ?", [opponent_email], (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: "Opponent not found" });
      }
      
      const checkSql = `
          SELECT id FROM bookings 
          WHERE ground_id = ? 
          AND booking_date = ? 
          AND (
              (start_time < ? AND end_time > ?) OR 
              (start_time < ? AND end_time > ?) OR 
              (start_time >= ? AND end_time <= ?)
          )
          AND status != 'Cancelled'
      `;
      
      db.query(checkSql, [
          ground_id, 
          challenge_date,
          end_time, start_time,
          end_time, start_time,
          start_time, end_time
      ], (err, results) => {
          if (err) {
              console.error("Database check error:", err);
              return res.status(500).json({ 
                  message: "Database error",
                  error: err 
              });
          }
          
          if (results.length > 0) {
              return res.status(400).json({ 
                  success: false,
                  message: "Time slot already booked" 
              });
          }
          
          const insertSql = `
              INSERT INTO challenges 
              (challenger_email, opponent_email, ground_id, challenge_date, start_time, end_time, sport, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
          `;
          
          db.query(insertSql, [
              challenger_email,
              opponent_email,
              ground_id,
              challenge_date,
              start_time,
              end_time,
              sport
          ], (err, result) => {
              if (err) {
                  console.error("Database insert error:", err);
                  return res.status(500).json({ 
                      success: false,
                      message: "Database error",
                      error: err 
                  });
              }
              
              console.log("Challenge created successfully with ID:", result.insertId);
              res.status(201).json({ 
                  success: true,
                  message: "Challenge sent successfully",
                  challengeId: result.insertId 
              });
          });
      });
  });
});

app.get("/api/challenges/:email", (req, res) => {
  const { email } = req.params;
  
  const sql = `
      SELECT c.*, g.name as ground_name, 
             ch.full_name as challenger_name, ch.team_name as challenger_team,
             op.full_name as opponent_name, op.team_name as opponent_team
      FROM challenges c
      JOIN grounds g ON c.ground_id = g.id
      JOIN Captains ch ON c.challenger_email = ch.email
      JOIN Captains op ON c.opponent_email = op.email
      WHERE c.opponent_email = ? OR c.challenger_email = ?
      ORDER BY c.challenge_date DESC, c.start_time DESC
  `;
  
  db.query(sql, [email, email], (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results);
  });
});

app.put("/api/challenges/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
  }
  
  const sql = "UPDATE challenges SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Challenge not found" });
      }
      res.json({ success: true, message: `Challenge ${status.toLowerCase()}` });
  });
});

app.get("/api/challenges/:email", (req, res) => {
  const { email } = req.params;
  
  const sql = `
      SELECT c.*, g.name as ground_name 
      FROM challenges c
      LEFT JOIN grounds g ON c.ground_id = g.id
      WHERE c.opponent_email = ? OR c.challenger_email = ?
      ORDER BY c.challenge_date ASC, c.start_time ASC
  `;
  
  db.query(sql, [email, email], (err, results) => {
      if (err) {
          console.error("Error fetching challenges:", err);
          return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results);
  });
});

app.put("/api/challenges/:id/accept", (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  
  const verifySql = "SELECT * FROM challenges WHERE id = ? AND opponent_email = ?";
  db.query(verifySql, [id, email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error",
        error: err.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to accept this challenge" 
      });
    }
    
    const updateSql = "UPDATE challenges SET status = 'Accepted' WHERE id = ?";
    db.query(updateSql, [id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error",
          error: err.message 
        });
      }
      
      const challenge = results[0];
      const bookingSql = `
        INSERT INTO bookings 
        (captain_email, ground_id, booking_date, start_time, end_time, sport, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
      `;
      
      db.query(bookingSql, [
        email,
        challenge.ground_id,
        challenge.challenge_date,
        challenge.start_time,
        challenge.end_time,
        challenge.sport
      ], (err, bookingResult) => {
        if (err) {
          console.error("Error creating booking:", err);
        }
        
        res.json({ 
          success: true, 
          message: "Challenge accepted and booking created"
        });
      });
    });
  });
});

app.put("/api/challenges/:id/decline", (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  
  if (!id || !email) {
    return res.status(400).json({ 
      success: false, 
      message: "Challenge ID and email are required" 
    });
  }

  const verifySql = "SELECT * FROM challenges WHERE id = ? AND opponent_email = ? AND status = 'Pending'";
  db.query(verifySql, [id, email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error",
        error: err.message,
        sql: verifySql 
      });
    }
    
    if (results.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to decline this challenge or challenge already processed" 
      });
    }
    
    const updateSql = "UPDATE challenges SET status = 'Rejected' WHERE id = ?";
    db.query(updateSql, [id], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error",
          error: err.message,
          sql: updateSql 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Challenge not found or already processed" 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Challenge declined successfully" 
      });
    });
  });
});

app.put("/api/challenges/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
  }
  
  const sql = "UPDATE challenges SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Challenge not found" });
      }
      res.json({ success: true, message: `Challenge ${status.toLowerCase()}` });
  });
});

app.get("/api/challenges/pending/:email", (req, res) => {
  const { email } = req.params;
  
  const sql = `
      SELECT c.*, g.name as ground_name, 
             ch.full_name as challenger_name, ch.team_name as challenger_team,
             op.full_name as opponent_name, op.team_name as opponent_team
      FROM challenges c
      JOIN grounds g ON c.ground_id = g.id
      JOIN Captains ch ON c.challenger_email = ch.email
      JOIN Captains op ON c.opponent_email = op.email
      WHERE (c.opponent_email = ? OR c.challenger_email = ?)
      AND c.status = 'Pending'
      ORDER BY c.challenge_date DESC, c.start_time DESC
  `;
  
  db.query(sql, [email, email], (err, results) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }
      res.json(results);
  });
});

app.get("/api/challenges/pending/:email", (req, res) => {
  const { email } = req.params;
  
  const sql = `
      SELECT c.*, g.name as ground_name, 
             ch.full_name as challenger_name, ch.team_name as challenger_team
      FROM challenges c
      JOIN grounds g ON c.ground_id = g.id
      JOIN Captains ch ON c.challenger_email = ch.email
      WHERE c.opponent_email = ?
      AND c.status = 'Pending'
      ORDER BY c.challenge_date ASC, c.start_time ASC
  `;
  
  db.query(sql, [email], (err, results) => {
      if (err) {
          console.error("Error fetching pending challenges:", err);
          return res.status(500).json({ 
              success: false,
              message: "Database error",
              error: err.message 
          });
      }
      
      res.json(results);
  });
});

app.get("/api/challenges/received/:email", (req, res) => {
  const { email } = req.params;
  
  const sql = `
    SELECT c.*, g.name as ground_name, 
           ch.full_name as challenger_name, ch.team_name as challenger_team
    FROM challenges c
    JOIN grounds g ON c.ground_id = g.id
    JOIN Captains ch ON c.challenger_email = ch.email
    WHERE c.opponent_email = ?
    AND c.status = 'Pending'
    ORDER BY c.challenge_date ASC, c.start_time ASC
  `;
  
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: "Database error",
        error: err.message 
      });
    }
    
    res.json({
      success: true,
      challenges: results
    });
  });
});

app.get("/api/challenges/sent/:email", (req, res) => {
  const { email } = req.params;
  
  const sql = `
      SELECT c.*, g.name as ground_name, 
             op.full_name as opponent_name, op.team_name as opponent_team
      FROM challenges c
      JOIN grounds g ON c.ground_id = g.id
      JOIN Captains op ON c.opponent_email = op.email
      WHERE c.challenger_email = ?
      ORDER BY c.challenge_date DESC, c.start_time DESC
  `;
  
  db.query(sql, [email], (err, results) => {
      if (err) {
          console.error("Error fetching sent challenges:", err);
          return res.status(500).json({ 
              message: "Database error",
              error: err.message 
          });
      }
      
      res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
