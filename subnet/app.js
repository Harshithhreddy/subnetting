function calculateSubnet() {
    let networkId = document.getElementById("networkId").value.trim();
    let subnets = parseInt(document.getElementById("subnets").value);

    if (!validateIP(networkId) || subnets < 1) {
        alert("Enter a valid Network ID and number of subnets.");
        return;
    }

    let [ip, prefix] = networkId.split("/");
    let ipParts = ip.split(".").map(Number);
    let firstOctet = ipParts[0];

    // Restrict subnetting to Class A, B, and C only
    if (!(firstOctet >= 1 && firstOctet <= 223)) {
        alert("Subnetting can only be done for Class A, Class B, and Class C.");
        return;
    }

    if (prefix === undefined) {
        prefix = getDefaultPrefix(firstOctet); // Determine class-based prefix
    } else {
        prefix = parseInt(prefix);
    }

    let subnetBits = Math.ceil(Math.log2(subnets)); 
    let newPrefix = prefix + subnetBits;
    
    if (newPrefix > 30) {
        alert("Too many subnets requested! Maximum limit exceeded.");
        return;
    }

    let subnetSize = Math.pow(2, 32 - newPrefix);
    let resultsTable = document.getElementById("results");
    resultsTable.innerHTML = "";

    for (let i = 0; i < subnets; i++) {
        let subnetAddress = [...ipParts];
        let offset = i * subnetSize;
        
        subnetAddress = applyOffset(subnetAddress, offset);

        let firstHost = [...subnetAddress];
        firstHost[3] += 1;

        let broadcast = [...subnetAddress];
        applyOffset(broadcast, subnetSize - 1);

        let lastHost = [...broadcast];
        lastHost[3] -= 1;

        resultsTable.innerHTML += `<tr>
            <td>${i + 1}</td>
            <td>${subnetAddress.join(".")}</td>
            <td>${firstHost.join(".")}</td>
            <td>${lastHost.join(".")}</td>
            <td>${broadcast.join(".")}</td>
        </tr>`;
    }

    document.getElementById("subnetMask").innerText = "Subnet Mask: " + getSubnetMask(newPrefix);
}

function validateIP(ip) {
    let regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(\/\d{1,2})?$/;
    return regex.test(ip);
}

function getDefaultPrefix(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) return 8; // Class A
    if (firstOctet >= 128 && firstOctet <= 191) return 16; // Class B
    if (firstOctet >= 192 && firstOctet <= 223) return 24; // Class C
    return -1; // Invalid class
}

function getSubnetMask(prefix) {
    let mask = [];
    for (let i = 0; i < 4; i++) {
        let bits = Math.min(8, prefix);
        mask.push(256 - Math.pow(2, 8 - bits));
        prefix -= bits;
    }
    return mask.join(".");
}

function applyOffset(ipParts, offset) {
    let total = ((ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]) + offset;
    ipParts[0] = (total >> 24) & 255;
    ipParts[1] = (total >> 16) & 255;
    ipParts[2] = (total >> 8) & 255;
    ipParts[3] = total & 255;
    return ipParts;
}
