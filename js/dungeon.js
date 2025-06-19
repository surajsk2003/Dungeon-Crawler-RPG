// Dungeon generation and management
const dungeon = {
    data: {
        width: 40, height: 30, tileSize: 20,
        tiles: [], rooms: []
    },
    
    generate: function() {
        const { width, height } = this.data;
        
        // Initialize with walls
        this.data.tiles = [];
        for (let y = 0; y < height; y++) {
            this.data.tiles[y] = [];
            for (let x = 0; x < width; x++) {
                this.data.tiles[y][x] = 1; // Wall
            }
        }
        
        // Generate rooms
        const numRooms = 8 + Math.floor(Math.random() * 4);
        const rooms = [];
        
        for (let i = 0; i < numRooms; i++) {
            let room = null;
            let attempts = 0;
            
            while (!room && attempts < 50) {
                const roomWidth = 5 + Math.floor(Math.random() * 8);
                const roomHeight = 5 + Math.floor(Math.random() * 8);
                const roomX = 1 + Math.floor(Math.random() * (width - roomWidth - 2));
                const roomY = 1 + Math.floor(Math.random() * (height - roomHeight - 2));
                
                const newRoom = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
                
                if (!this.roomsOverlap(newRoom, rooms)) {
                    room = newRoom;
                    rooms.push(room);
                }
                attempts++;
            }
        }
        
        // Carve out rooms
        rooms.forEach(room => {
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    this.data.tiles[y][x] = 0; // Floor
                }
            }
        });
        
        // Connect rooms
        this.connectRooms(rooms);
        this.data.rooms = rooms;
        
        // Place player in first room
        if (rooms.length > 0) {
            const firstRoom = rooms[0];
            player.data.x = (firstRoom.x + Math.floor(firstRoom.width / 2)) * this.data.tileSize;
            player.data.y = (firstRoom.y + Math.floor(firstRoom.height / 2)) * this.data.tileSize;
        }
    },
    
    roomsOverlap: function(room, rooms) {
        return rooms.some(existingRoom => 
            !(room.x + room.width + 1 < existingRoom.x || 
              existingRoom.x + existingRoom.width + 1 < room.x || 
              room.y + room.height + 1 < existingRoom.y || 
              existingRoom.y + existingRoom.height + 1 < room.y)
        );
    },
    
    connectRooms: function(rooms) {
        for (let i = 1; i < rooms.length; i++) {
            const prevRoom = rooms[i - 1];
            const currRoom = rooms[i];
            
            const prevCenter = {
                x: Math.floor(prevRoom.x + prevRoom.width / 2),
                y: Math.floor(prevRoom.y + prevRoom.height / 2)
            };
            
            const currCenter = {
                x: Math.floor(currRoom.x + currRoom.width / 2),
                y: Math.floor(currRoom.y + currRoom.height / 2)
            };
            
            // Horizontal corridor
            const minX = Math.min(prevCenter.x, currCenter.x);
            const maxX = Math.max(prevCenter.x, currCenter.x);
            for (let x = minX; x <= maxX; x++) {
                this.data.tiles[prevCenter.y][x] = 0;
            }
            
            // Vertical corridor
            const minY = Math.min(prevCenter.y, currCenter.y);
            const maxY = Math.max(prevCenter.y, currCenter.y);
            for (let y = minY; y <= maxY; y++) {
                this.data.tiles[y][currCenter.x] = 0;
            }
        }
    },
    
    canMoveTo: function(x, y, width, height) {
        const { tileSize, tiles, width: dungeonWidth, height: dungeonHeight } = this.data;
        const leftTile = Math.floor(x / tileSize);
        const rightTile = Math.floor((x + width) / tileSize);
        const topTile = Math.floor(y / tileSize);
        const bottomTile = Math.floor((y + height) / tileSize);
        
        if (leftTile < 0 || rightTile >= dungeonWidth || 
            topTile < 0 || bottomTile >= dungeonHeight) {
            return false;
        }
        
        return tiles[topTile][leftTile] === 0 &&
               tiles[topTile][rightTile] === 0 &&
               tiles[bottomTile][leftTile] === 0 &&
               tiles[bottomTile][rightTile] === 0;
    }
};