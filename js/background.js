var request = function(url, queryString) {
    return $.ajax({
        url: url,
        data: queryString
    })
}

Foursquare = function() {
    this.clientSecret = ""
    this.clientID = ""
    this.m = "foursquare"
    this.version = new Date().toJSON().slice(0, 10).replace(/[\\-]/g,'')
    this.baseURL = "https://api.foursquare.com"
    this.near = "manhattan"
}

Foursquare.prototype.getVenues = function(query) {
    var uri = "/v2/venues/search"
    url = [this.baseURL, uri].join("/")
    return request(url, {
        client_secret: this.clientSecret,
        client_id: this.clientID,
        m: this.m,
        v: this.version,
        query: query,
        near: this.near
    })
}

Foursquare.prototype.getVenue = function(id) {
    var uri = "/v2/venues"
    url = [this.baseURL, uri, id].join("/")
    return request(url, {
        client_secret: this.clientSecret,
        client_id: this.clientID,
        v: this.version
    })
}

$(function() {
    setTimeout(function() {

        // TODO: use this for paging. ty @hswolfff
        // angular.element(document.documentElement).injector().get('$rootScope').$on('$routeChangeSuccess', function(c) {})

        $("span.restaurant-name").each(function(idx, html) {
            var name = $(this).text()
            var fs = new Foursquare()

            var addressHref = $(this).parent().attr('href')

            // remove special characters from a temp name because the href wont have them in there.
            // example:
            // href = amcook-asian-cuisine--sushi-bar-154-w-72nd-st
            // name = amcook-asian-cuisine-&-sushi-bar
            // as a result, this part doesnt work `.replace(name.toLowerCase() + " ", "")`
            var n = name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g,'')
            var address = addressHref.split("/")[2].replace(/-/g, " ").replace(n.toLowerCase() + " ", "").replace("new york", "").trim()

            var venues = fs.getVenues(name)
            venues.success(function(data, textStatus, jqXHR) {
                var venue = data.response.venues.filter(function(v) {
                    if (v.location.address != null) {
                       if(v.location.address.toLowerCase() === address.toLowerCase()) {
                           return v
                       }
                   }
                })[0]
                if(venue != null) {
                    var v = fs.getVenue(venue.id)
                    v.success(function(d, ts, jqxhr) {
                        var rating = d.response.venue.rating
                        if(rating == null) {
                            rating = "N/A"
                        }
                        var foursquarePageURL = "http://foursquare.com/v/" + [d.response.venue.name, d.response.venue.id].join("/")
                        $(html).append("<h4><a style='color: chocolate' id='foursquare-rating' href='" + foursquarePageURL + "'>Foursquare Rating: " + rating + "</a></h4>")
                    })
                }
            })
        })
    }, 2000)
})
