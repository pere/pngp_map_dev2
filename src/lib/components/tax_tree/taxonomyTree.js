/**
 * Taxonomy Utilities for Species Data
 *
 * //src/lib/data/sp_tax_counts_dbase_new_geo.js
   {
    tax_id: 75,
    name_it: "Cornacchia nera",
    name_eng: "Carrion Crow",
    species: "Corvus corone corone",
    genus: "Corvus",
    family: "Corvidae",
    order: "Passeriformes",
    class: "Aves",
    obs_count: 163,
  },
 */

export function createTaxonomyHierarchy(speciesArray, options = {}) {
  console.log(speciesArray, "speciesArray from taxonomyTreeNew");

  // Early return with default structure if data is invalid
  if (!speciesArray || !Array.isArray(speciesArray) || speciesArray.length === 0) {
    console.warn("Invalid or empty speciesArray provided:", speciesArray);
    return {
      name: "Root",
      level: "root",
      count: 0,
      children: [],
    };
  }


  const {
    hierarchyLevels = ["class", "order",  "family","genus", "species"],
    countField = "obs_count",
    nameFields = {
      species: "species",
      english: "name_eng",
      italian: "name_it",
    },
  } = options;

  const root = {
    name: "Root",
    level: "root",
    count: 0,
    children: [],
  };


 // console.log(speciesArray, "speciesArray from taxonomyTree");

  speciesArray.forEach((species,i) => {

    let currentNode = root;
    currentNode.count += species[countField] || 1;

    hierarchyLevels.forEach((level) => {
      const isSpeciesLevel = level === "species";
      const nodeName = isSpeciesLevel
        ? species[nameFields.species]
        : species[level];

      if (!nodeName) return;

      let childNode = currentNode.children.find((n) => n.name === nodeName);

      if (!childNode) {
        if (!isSpeciesLevel)
        {
          childNode = {
            name: nodeName,
            level,
            count: 0,
            /*   sp_name: isSpeciesLevel ? species['species'] : null,
            name_eng: isSpeciesLevel ? species['name_eng'] : null,
            name_it: isSpeciesLevel ? species['name_it'] : null, */
            children: [],
          };
        }
        else
        {
          childNode = {
            name: nodeName,
            level,
            count: 0,
              sp_name: isSpeciesLevel ? species['species'] : null,
            name_eng: isSpeciesLevel ? species['name_eng'] : null,
            name_it: isSpeciesLevel ? species['name_it'] : null,
            children: [],
          };
        }

        currentNode.children.push(childNode);
      }

      childNode.count += species[countField] || 1;
      currentNode = childNode;
    });
  });

  return root;
}

export function filterTaxonomy(tree, filters) {
  const filtered = JSON.parse(JSON.stringify(tree));

  function applyFilters(node) {
    node.children = node.children.filter((child) => {
      // Apply all filters
      for (const [key, value] of Object.entries(filters)) {
        if (child[key] !== undefined && child[key] !== value) {
          return false;
        }
      }
      return true;
    });

    // Recalculate counts after filtering
    node.children.forEach((child) => {
      applyFilters(child);
      if (child.children.length > 0) {
        child.count = child.children.reduce((sum, c) => sum + c.count, 0);
      }
    });

    return node;
  }

  return applyFilters(filtered);
}

export function getTaxonomyFlatList(tree) {
  const result = [];

  function traverse(node, depth = 0, parentPath = []) {
    const currentPath = [...parentPath, node.name];

    result.push({
      ...node,
      depth,
      path: currentPath.join(" > "),
      pathArray: currentPath,
    });

    node.children.forEach((child) => traverse(child, depth + 1, currentPath));
  }

  traverse(tree);
  return result;
}

// Utility for getting all unique values at a specific level
export function getTaxonAtLevel(tree, targetLevel) {
  const items = new Set();

  function traverse(node) {
    if (node.level === targetLevel) {
      items.add(node.name);
    }
    node.children.forEach(traverse);
  }

  traverse(tree);
  return Array.from(items);
}
// Utility function to flatten taxonomy
export function flattenTaxonomy(data) {
  console.log(data, "data from flattenTaxonomy");
  const result = [];

  function traverse(node, depth = 0, path = []) {
    const currentPath = [...path, node.name];
    result.push({
      ...node,
      depth,
      path: currentPath.join(" > "),
      pathArray: currentPath,
    });

    if (node.children) {
      node.children.forEach((child) => traverse(child, depth + 1, currentPath));
    }
  }

  // First convert to hierarchical structure if needed
  const hierarchicalData = createTaxonomyHierarchy(data);
  traverse(hierarchicalData);
  return result;
}

//$inspect(hierarchicalData);
export function getFlatTaxonomy(data) {
  return flattenTaxonomy(createTaxonomyHierarchy(data));
}
