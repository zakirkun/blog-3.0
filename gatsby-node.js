const path = require('path');
const _ = require('lodash');
const { fmImagesToRelative } = require('gatsby-remark-relative-images');

const homeTemplate = path.resolve('./src/templates/index.tsx');
const tagTemplate = path.resolve('./src/templates/tags.tsx');
const authorTemplate = path.resolve('./src/templates/author.tsx');
const postTemplate = path.resolve('./src/templates/post.tsx');

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  fmImagesToRelative(node);

  switch (node.internal.type) {
    case 'MarkdownRemark': {
      const { permalink, layout, primaryTag } = node.frontmatter;
      const { relativePath } = getNode(node.parent);

      let slug = permalink;

      if (!slug) {
        if (relativePath.indexOf('en/index.md') >= 0) {
          slug = `/${relativePath.replace('en/index.md', 'en')}/`;
        } else {
          slug = `/${relativePath.replace('/index.md', '')}/`;
        }
      }

      // Used to generate URL to view this content.
      createNodeField({
        node,
        name: 'slug',
        value: slug || '',
      });

      // Used to determine a page layout.
      createNodeField({
        node,
        name: 'layout',
        value: layout || '',
      });

      createNodeField({
        node,
        name: 'primaryTag',
        value: primaryTag || '',
      });
    }
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    {
      allMarkdownRemark(
        limit: 2000
        sort: {
          fields: [frontmatter___date],
          order: ASC
        }
        filter: {
          frontmatter: {
            draft: {
              ne: true
            }
            lang: {
              eq: "id"
            }
          }
        }
      ) {
        edges {
          node {
            excerpt
            timeToRead
            frontmatter {
              title
              tags
              date
              draft
              lang
              description
              image {
                childImageSharp {
                  fluid(maxWidth: 1200) {
                    aspectRatio
                    base64
                    sizes
                    src
                    srcSet
                  }
                }
              }
              author {
                id
                bio
                avatar {
                  children {
                    ... on ImageSharp {
                      fixed(quality: 90) {
                        src
                      }
                    }
                  }
                }
              }
            }
            fields {
              layout
              slug
            }
          }
        }
      }
      allAuthorYaml {
        edges {
          node {
            id
          }
        }
      }
    }
  `);

  if (result.errors) {
    console.error(result.errors);
    throw new Error(result.errors);
  }

  // Create post pages
  const posts = result.data.allMarkdownRemark.edges;

  // Create paginated index
  const postsPerPage = 6;
  const numPages = Math.ceil(posts.length / postsPerPage);

  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/' : `/${i + 1}`,
      component: homeTemplate,
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1
      },
    });
  });

  posts.forEach(({ node }, index) => {
    const { slug, lang } = node.fields;
    const slugEn = slug + 'en/'
    const prev = index === 0 ? null : posts[index - 1].node;
    const next = index === posts.length - 1 ? null : posts[index + 1].node;

    createPage({
      path: slug,
      component: postTemplate,
      context: {
        lang,
        slug,
        prev,
        next,
        primaryTag: node.frontmatter.tags ? node.frontmatter.tags[0] : '',
      },
    });

    createPage({
      path: slugEn,
      component: postTemplate,
      context: {
        lang,
        slug: slugEn,
        prev,
        next,
        primaryTag: node.frontmatter.tags ? node.frontmatter.tags[0] : '',
      },
    });
  });

  // Create tag pages
  const tags = _.uniq(
    _.flatten(
      result.data.allMarkdownRemark.edges.map(edge => {
        return _.castArray(_.get(edge, 'node.frontmatter.tags', []));
      }),
    ),
  );

  tags.forEach(tag => {
    createPage({
      path: `/tags/${_.kebabCase(tag)}/`,
      component: tagTemplate,
      context: {
        tag,
      },
    });
  });

  // Create author pages
  result.data.allAuthorYaml.edges.forEach(edge => {
    createPage({
      path: `/author/${_.kebabCase(edge.node.id)}/`,
      component: authorTemplate,
      context: {
        author: edge.node.id,
      },
    });
  });
};

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  // adds sourcemaps for tsx in dev mode
  if (stage === `develop` || stage === `develop-html`) {
    actions.setWebpackConfig({
      devtool: 'eval-source-map',
    });
  }
};
