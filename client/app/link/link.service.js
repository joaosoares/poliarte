'use strict';

angular.module('poliarte2App')
  .factory('Link', function ($http, youtubeEmbedUtils) {
    // Service logic
    // ...


    var getLikes = function (likesObj) {
      try {
        return likesObj.data.length;
      } catch (err) {
        return 0;
      }
    }

    var getLink = function (post, linkUrl) {
      this.initialize = function() {
        var link = this;
        link.url = linkUrl;
        link.created_time = post.created_time;
        link.videoId = youtubeEmbedUtils.getIdFromURL(linkUrl);
        link.author = post.from.name;
        link.likes = getLikes(post.likes);
        link.message = post.message;
        link.active = false;
        link.thumbnailUrl = 'https://img.youtube.com/vi/' + link.videoId + '/1.jpg';

        var url = 'https://gdata.youtube.com/feeds/api/videos/' + youtubeEmbedUtils.getIdFromURL(linkUrl);
        $http.get(url, {
          params: {
            v: '2',
            alt: 'json'
          }
        }).success(function (videoinfo) {
          link.title = videoinfo.entry.title.$t;
          link.category = videoinfo.entry.category[1].label;

          return link;
        }).error(function (error) {
          link = false;
          return link;
        });
      };

      this.initialize();
    };

    // Public API here
    return (getLink);

  });
